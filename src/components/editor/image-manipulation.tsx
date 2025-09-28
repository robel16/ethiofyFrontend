"use client";

import { useState, useEffect } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Move,
  RotateCw,
  Maximize2,
  Crop,
  Palette,
  Contrast,
  Sun,
  Droplets,
  Filter,
  Scissors,
} from "lucide-react";

interface ImageManipulationProps {
  canvas: fabric.Canvas | null;
  selectedElement: fabric.Object | null;
  onImageChange?: () => void;
  onCropStart?: (image: fabric.Image) => void;
}

export function ImageManipulation({
  canvas,
  selectedElement,
  onImageChange,
  onCropStart,
}: ImageManipulationProps) {
  const [imageProperties, setImageProperties] = useState({
    left: 0,
    top: 0,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    opacity: 1,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
  });

  const isImageElement = selectedElement && selectedElement.type === "image";

  // Update properties when selected element changes
  useEffect(() => {
    if (isImageElement) {
      const imgObj = selectedElement as fabric.Image;
      setImageProperties({
        left: Math.round(imgObj.left || 0),
        top: Math.round(imgObj.top || 0),
        scaleX: imgObj.scaleX || 1,
        scaleY: imgObj.scaleY || 1,
        angle: imgObj.angle || 0,
        opacity: imgObj.opacity || 1,
        brightness: 0, // These would need to be stored in custom properties
        contrast: 0,
        saturation: 0,
        blur: 0,
      });
    }
  }, [selectedElement, isImageElement]);

  if (!isImageElement) {
    return (
      <div className="p-4 text-center">
        <Move className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="text-gray-500">Select an image to edit properties</p>
      </div>
    );
  }

  const updateImageProperty = (property: string, value: any) => {
    if (!canvas || !selectedElement) return;

    const imgObj = selectedElement as fabric.Image;
    imgObj.set(property, value);
    canvas.renderAll();

    setImageProperties((prev) => ({ ...prev, [property]: value }));
    onImageChange?.();
  };

  const applyImageFilter = (filterType: string, value: number) => {
    if (!canvas || !selectedElement) return;

    const imgObj = selectedElement as fabric.Image;
    const filters = imgObj.filters || [];

    // Remove existing filter of the same type
    const filteredFilters = filters.filter((filter) => {
      if (
        filterType === "brightness" &&
        filter instanceof fabric.Image.filters.Brightness
      )
        return false;
      if (
        filterType === "contrast" &&
        filter instanceof fabric.Image.filters.Contrast
      )
        return false;
      if (
        filterType === "saturation" &&
        filter instanceof fabric.Image.filters.Saturation
      )
        return false;
      if (filterType === "blur" && filter instanceof fabric.Image.filters.Blur)
        return false;
      return true;
    });

    // Add new filter if value is not default
    if (value !== 0) {
      switch (filterType) {
        case "brightness":
          filteredFilters.push(
            new fabric.Image.filters.Brightness({ brightness: value })
          );
          break;
        case "contrast":
          filteredFilters.push(
            new fabric.Image.filters.Contrast({ contrast: value })
          );
          break;
        case "saturation":
          filteredFilters.push(
            new fabric.Image.filters.Saturation({ saturation: value })
          );
          break;
        case "blur":
          filteredFilters.push(new fabric.Image.filters.Blur({ blur: value }));
          break;
      }
    }

    imgObj.filters = filteredFilters;
    imgObj.applyFilters();
    canvas.renderAll();

    setImageProperties((prev) => ({ ...prev, [filterType]: value }));
    onImageChange?.();
  };

  const resetImage = () => {
    if (!canvas || !selectedElement) return;

    const imgObj = selectedElement as fabric.Image;
    imgObj.set({
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      opacity: 1,
      filters: [],
    });

    imgObj.applyFilters();
    canvas.renderAll();

    setImageProperties((prev) => ({
      ...prev,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      opacity: 1,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
    }));

    onImageChange?.();
  };

  const flipHorizontal = () => {
    updateImageProperty("flipX", !selectedElement.flipX);
  };

  const flipVertical = () => {
    updateImageProperty("flipY", !selectedElement.flipY);
  };

  const fitToDesignArea = () => {
    if (!canvas || !selectedElement) return;

    const imgObj = selectedElement as fabric.Image;
    const designArea = { width: 120, height: 160 };

    const scale = Math.min(
      designArea.width / imgObj.width!,
      designArea.height / imgObj.height!
    );

    imgObj.set({
      left: 280, // Center in design area
      top: 250,
      scaleX: scale,
      scaleY: scale,
    });

    canvas.renderAll();
    onImageChange?.();
  };

  const startCropping = () => {
    if (!selectedElement || selectedElement.type !== "image") return;
    onCropStart?.(selectedElement as fabric.Image);
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Image Properties
        </h3>
      </div>

      {/* Position Controls */}
      <div>
        <Label className="mb-3 flex items-center text-sm font-medium">
          <Move className="mr-2 h-4 w-4" />
          Position
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="img-left" className="text-xs">
              X Position
            </Label>
            <Input
              id="img-left"
              type="number"
              value={imageProperties.left}
              onChange={(e) =>
                updateImageProperty("left", parseInt(e.target.value))
              }
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="img-top" className="text-xs">
              Y Position
            </Label>
            <Input
              id="img-top"
              type="number"
              value={imageProperties.top}
              onChange={(e) =>
                updateImageProperty("top", parseInt(e.target.value))
              }
              className="h-8"
            />
          </div>
        </div>
      </div>

      {/* Scale Controls */}
      <div>
        <Label className="mb-3 flex items-center text-sm font-medium">
          <Maximize2 className="mr-2 h-4 w-4" />
          Scale
        </Label>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Width Scale</Label>
            <Slider
              value={[imageProperties.scaleX * 100]}
              onValueChange={([value]) =>
                updateImageProperty("scaleX", value / 100)
              }
              max={300}
              min={10}
              step={1}
              className="mt-1 w-full"
            />
            <div className="mt-1 text-xs text-gray-500">
              {Math.round(imageProperties.scaleX * 100)}%
            </div>
          </div>
          <div>
            <Label className="text-xs">Height Scale</Label>
            <Slider
              value={[imageProperties.scaleY * 100]}
              onValueChange={([value]) =>
                updateImageProperty("scaleY", value / 100)
              }
              max={300}
              min={10}
              step={1}
              className="mt-1 w-full"
            />
            <div className="mt-1 text-xs text-gray-500">
              {Math.round(imageProperties.scaleY * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div>
        <Label className="mb-3 flex items-center text-sm font-medium">
          <RotateCw className="mr-2 h-4 w-4" />
          Rotation
        </Label>
        <Slider
          value={[imageProperties.angle]}
          onValueChange={([value]) => updateImageProperty("angle", value)}
          max={180}
          min={-180}
          step={1}
          className="w-full"
        />
        <div className="mt-1 text-xs text-gray-500">
          {Math.round(imageProperties.angle)}°
        </div>
      </div>

      {/* Opacity */}
      <div>
        <Label className="mb-3 flex items-center text-sm font-medium">
          <Droplets className="mr-2 h-4 w-4" />
          Opacity
        </Label>
        <Slider
          value={[imageProperties.opacity * 100]}
          onValueChange={([value]) =>
            updateImageProperty("opacity", value / 100)
          }
          max={100}
          min={0}
          step={1}
          className="w-full"
        />
        <div className="mt-1 text-xs text-gray-500">
          {Math.round(imageProperties.opacity * 100)}%
        </div>
      </div>

      {/* Image Filters */}
      <div>
        <Label className="mb-3 flex items-center text-sm font-medium">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Label>

        <div className="space-y-3">
          {/* Brightness */}
          <div>
            <Label className="flex items-center text-xs">
              <Sun className="mr-1 h-3 w-3" />
              Brightness
            </Label>
            <Slider
              value={[imageProperties.brightness]}
              onValueChange={([value]) => applyImageFilter("brightness", value)}
              max={1}
              min={-1}
              step={0.1}
              className="mt-1 w-full"
            />
          </div>

          {/* Contrast */}
          <div>
            <Label className="flex items-center text-xs">
              <Contrast className="mr-1 h-3 w-3" />
              Contrast
            </Label>
            <Slider
              value={[imageProperties.contrast]}
              onValueChange={([value]) => applyImageFilter("contrast", value)}
              max={1}
              min={-1}
              step={0.1}
              className="mt-1 w-full"
            />
          </div>

          {/* Saturation */}
          <div>
            <Label className="flex items-center text-xs">
              <Palette className="mr-1 h-3 w-3" />
              Saturation
            </Label>
            <Slider
              value={[imageProperties.saturation]}
              onValueChange={([value]) => applyImageFilter("saturation", value)}
              max={1}
              min={-1}
              step={0.1}
              className="mt-1 w-full"
            />
          </div>

          {/* Blur */}
          <div>
            <Label className="text-xs">Blur</Label>
            <Slider
              value={[imageProperties.blur]}
              onValueChange={([value]) => applyImageFilter("blur", value)}
              max={0.1}
              min={0}
              step={0.01}
              className="mt-1 w-full"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-4">
        <Label className="mb-3 block text-sm font-medium">Quick Actions</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={flipHorizontal}
            className="text-xs"
          >
            Flip H
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={flipVertical}
            className="text-xs"
          >
            Flip V
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fitToDesignArea}
            className="text-xs"
          >
            Fit Area
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetImage}
            className="text-xs"
          >
            Reset
          </Button>
        </div>

        {/* Crop Button */}
        <div className="mt-3">
          <Button onClick={startCropping} className="w-full" size="sm">
            <Scissors className="mr-2 h-4 w-4" />
            Crop Image
          </Button>
        </div>
      </div>
    </div>
  );
}
