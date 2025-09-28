"use client";

import { useState, useRef, useEffect } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Crop,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Check,
  X,
  Square,
  Circle,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCropperProps {
  image: fabric.Image;
  canvas: fabric.Canvas;
  onCropComplete?: (croppedImage: fabric.Image) => void;
  onCancel?: () => void;
}

interface CropArea {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function ImageCropper({
  image,
  canvas,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [cropArea, setCropArea] = useState<CropArea>({
    left: 0,
    top: 0,
    width: image.width || 100,
    height: image.height || 100,
  });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const cropRectRef = useRef<fabric.Rect | null>(null);
  const originalImageRef = useRef<fabric.Image | null>(null);

  useEffect(() => {
    // Store original image reference
    originalImageRef.current = fabric.util.object.clone(image);

    // Create crop rectangle overlay
    const cropRect = new fabric.Rect({
      left: image.left || 0,
      top: image.top || 0,
      width: cropArea.width,
      height: cropArea.height,
      fill: "transparent",
      stroke: "#3b82f6",
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: true,
      evented: true,
      excludeFromExport: true,
    });

    // Add resize controls
    cropRect.setControlsVisibility({
      mt: true, // middle top
      mb: true, // middle bottom
      ml: true, // middle left
      mr: true, // middle right
      tl: true, // top left
      tr: true, // top right
      bl: true, // bottom left
      br: true, // bottom right
      mtr: false, // rotation control
    });

    canvas.add(cropRect);
    canvas.setActiveObject(cropRect);
    cropRectRef.current = cropRect;

    // Handle crop area changes
    const handleCropChange = () => {
      if (cropRect) {
        const newCropArea = {
          left: cropRect.left || 0,
          top: cropRect.top || 0,
          width: cropRect.width! * (cropRect.scaleX || 1),
          height: cropRect.height! * (cropRect.scaleY || 1),
        };
        setCropArea(newCropArea);
      }
    };

    cropRect.on("modified", handleCropChange);
    cropRect.on("moving", handleCropChange);
    cropRect.on("scaling", handleCropChange);

    return () => {
      if (cropRectRef.current) {
        canvas.remove(cropRectRef.current);
        cropRectRef.current = null;
      }
    };
  }, []);

  const setAspectRatioConstraint = (ratio: number | null) => {
    setAspectRatio(ratio);

    if (cropRectRef.current && ratio) {
      const currentWidth = cropArea.width;
      const newHeight = currentWidth / ratio;

      cropRectRef.current.set({
        height: newHeight,
        scaleY: 1,
      });

      setCropArea((prev) => ({ ...prev, height: newHeight }));
      canvas.renderAll();
    }
  };

  const handleRotation = (degrees: number) => {
    setRotation((prev) => prev + degrees);

    if (originalImageRef.current) {
      const newAngle = (originalImageRef.current.angle || 0) + degrees;
      image.set("angle", newAngle);
      canvas.renderAll();
    }
  };

  const handleFlip = (direction: "horizontal" | "vertical") => {
    if (direction === "horizontal") {
      setFlipX(!flipX);
      image.set("flipX", !flipX);
    } else {
      setFlipY(!flipY);
      image.set("flipY", !flipY);
    }
    canvas.renderAll();
  };

  const applyCrop = () => {
    if (!originalImageRef.current || !cropRectRef.current) return;

    // Calculate crop coordinates relative to the image
    const imageLeft = image.left || 0;
    const imageTop = image.top || 0;
    const imageScaleX = image.scaleX || 1;
    const imageScaleY = image.scaleY || 1;

    const cropLeft = (cropArea.left - imageLeft) / imageScaleX;
    const cropTop = (cropArea.top - imageTop) / imageScaleY;
    const cropWidth = cropArea.width / imageScaleX;
    const cropHeight = cropArea.height / imageScaleY;

    // Create cropped image using canvas
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) return;

    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;

    // Get the original image element
    const imgElement = (originalImageRef.current as any)._element;

    if (imgElement) {
      tempCtx.drawImage(
        imgElement,
        cropLeft,
        cropTop,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      // Create new fabric image from cropped canvas
      const croppedDataUrl = tempCanvas.toDataURL();

      fabric.Image.fromURL(croppedDataUrl, (croppedImg) => {
        croppedImg.set({
          left: cropArea.left,
          top: cropArea.top,
          scaleX: imageScaleX,
          scaleY: imageScaleY,
          angle: rotation,
          flipX: flipX,
          flipY: flipY,
        });

        // Remove original image and crop rectangle
        canvas.remove(image);
        if (cropRectRef.current) {
          canvas.remove(cropRectRef.current);
        }

        // Add cropped image
        canvas.add(croppedImg);
        canvas.setActiveObject(croppedImg);
        canvas.renderAll();

        onCropComplete?.(croppedImg);
      });
    }
  };

  const cancelCrop = () => {
    // Remove crop rectangle
    if (cropRectRef.current) {
      canvas.remove(cropRectRef.current);
    }

    // Reset image transformations
    if (originalImageRef.current) {
      image.set({
        angle: originalImageRef.current.angle || 0,
        flipX: originalImageRef.current.flipX || false,
        flipY: originalImageRef.current.flipY || false,
      });
      canvas.renderAll();
    }

    onCancel?.();
  };

  return (
    <div className="space-y-4 border-l border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Crop Image</h3>
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={applyCrop}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-1 h-4 w-4" />
            Apply
          </Button>
          <Button size="sm" variant="outline" onClick={cancelCrop}>
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Aspect Ratio Presets */}
      <div>
        <Label className="mb-2 block text-sm font-medium">Aspect Ratio</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={aspectRatio === null ? "default" : "outline"}
            size="sm"
            onClick={() => setAspectRatioConstraint(null)}
            className="text-xs"
          >
            <Maximize2 className="mr-1 h-3 w-3" />
            Free
          </Button>
          <Button
            variant={aspectRatio === 1 ? "default" : "outline"}
            size="sm"
            onClick={() => setAspectRatioConstraint(1)}
            className="text-xs"
          >
            <Square className="mr-1 h-3 w-3" />
            1:1
          </Button>
          <Button
            variant={aspectRatio === 4 / 3 ? "default" : "outline"}
            size="sm"
            onClick={() => setAspectRatioConstraint(4 / 3)}
            className="text-xs"
          >
            4:3
          </Button>
          <Button
            variant={aspectRatio === 16 / 9 ? "default" : "outline"}
            size="sm"
            onClick={() => setAspectRatioConstraint(16 / 9)}
            className="text-xs"
          >
            16:9
          </Button>
        </div>
      </div>

      {/* Rotation */}
      <div>
        <Label className="mb-2 block text-sm font-medium">Rotation</Label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotation(-90)}
          >
            <RotateCw className="h-4 w-4 rotate-180 transform" />
          </Button>
          <div className="flex-1">
            <Slider
              value={[rotation]}
              onValueChange={([value]) => {
                const diff = value - rotation;
                handleRotation(diff);
              }}
              max={180}
              min={-180}
              step={1}
              className="w-full"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotation(90)}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-1 text-center text-xs text-gray-500">
          {rotation}°
        </div>
      </div>

      {/* Flip Controls */}
      <div>
        <Label className="mb-2 block text-sm font-medium">Flip</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={flipX ? "default" : "outline"}
            size="sm"
            onClick={() => handleFlip("horizontal")}
            className="text-xs"
          >
            <FlipHorizontal className="mr-1 h-4 w-4" />
            Horizontal
          </Button>
          <Button
            variant={flipY ? "default" : "outline"}
            size="sm"
            onClick={() => handleFlip("vertical")}
            className="text-xs"
          >
            <FlipVertical className="mr-1 h-4 w-4" />
            Vertical
          </Button>
        </div>
      </div>

      {/* Crop Area Info */}
      <div className="border-t border-gray-200 pt-4">
        <Label className="mb-2 block text-sm font-medium">Crop Area</Label>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>Width: {Math.round(cropArea.width)}px</div>
          <div>Height: {Math.round(cropArea.height)}px</div>
          <div>X: {Math.round(cropArea.left)}</div>
          <div>Y: {Math.round(cropArea.top)}</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <h4 className="mb-1 text-sm font-medium text-blue-900">
          Instructions:
        </h4>
        <ul className="space-y-1 text-xs text-blue-800">
          <li>• Drag the blue rectangle to select crop area</li>
          <li>• Use corner handles to resize</li>
          <li>• Apply aspect ratio constraints if needed</li>
          <li>• Rotate and flip before cropping</li>
        </ul>
      </div>
    </div>
  );
}
