"use client";

import { useState, useEffect } from "react";
import { fabric } from "fabric";
import { ProductColor, ProductView } from "@/types";
import { cn } from "@/lib/utils";

interface VariantPreviewProps {
  canvas: fabric.Canvas | null;
  selectedColor: ProductColor;
  selectedView: ProductView;
  className?: string;
}

export function VariantPreview({
  canvas,
  selectedColor,
  selectedView,
  className,
}: VariantPreviewProps) {
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (canvas) {
      updatePreview();
    }
  }, [canvas, selectedColor, selectedView]);

  const updatePreview = () => {
    if (!canvas) return;

    try {
      // Create a temporary canvas for preview
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");

      if (!tempCtx) return;

      // Set canvas size
      tempCanvas.width = 300;
      tempCanvas.height = 350;

      // Draw product background
      tempCtx.fillStyle = selectedColor.hex;
      tempCtx.fillRect(75, 62, 150, 175); // Product shape

      // Add product outline
      tempCtx.strokeStyle = "#e5e7eb";
      tempCtx.lineWidth = 2;
      tempCtx.strokeRect(75, 62, 150, 175);

      // Get design elements from main canvas
      const designElements = canvas
        .getObjects()
        .filter((obj) => !obj.excludeFromExport);

      if (designElements.length > 0) {
        // Scale and position design elements for preview
        const scaleX = 150 / 120; // Preview width / design area width
        const scaleY = 175 / 160; // Preview height / design area height
        const offsetX = 75; // Preview left position
        const offsetY = 62; // Preview top position

        designElements.forEach((obj) => {
          const objLeft = (obj.left || 0) - 240; // Relative to design area
          const objTop = (obj.top || 0) - 220; // Relative to design area

          const previewLeft = offsetX + objLeft * scaleX;
          const previewTop = offsetY + objTop * scaleY;

          if (obj.type === "i-text" || obj.type === "text") {
            const textObj = obj as fabric.IText;
            tempCtx.font = `${(textObj.fontSize || 20) * scaleX}px ${textObj.fontFamily || "Arial"}`;
            tempCtx.fillStyle = (textObj.fill as string) || "#000000";
            tempCtx.fillText(textObj.text || "", previewLeft, previewTop);
          } else if (obj.type === "image") {
            const imgObj = obj as fabric.Image;
            const imgElement = (imgObj as any)._element;

            if (imgElement) {
              const imgWidth =
                (imgObj.width || 0) * (imgObj.scaleX || 1) * scaleX;
              const imgHeight =
                (imgObj.height || 0) * (imgObj.scaleY || 1) * scaleY;

              tempCtx.drawImage(
                imgElement,
                previewLeft,
                previewTop,
                imgWidth,
                imgHeight
              );
            }
          } else if (obj.type === "rect") {
            const rectObj = obj as fabric.Rect;
            tempCtx.fillStyle = (rectObj.fill as string) || "#000000";
            const rectWidth =
              (rectObj.width || 0) * (rectObj.scaleX || 1) * scaleX;
            const rectHeight =
              (rectObj.height || 0) * (rectObj.scaleY || 1) * scaleY;
            tempCtx.fillRect(previewLeft, previewTop, rectWidth, rectHeight);
          }
        });
      }

      // Convert to data URL
      const dataUrl = tempCanvas.toDataURL();
      setPreviewDataUrl(dataUrl);
    } catch (error) {
      console.error("Error generating preview:", error);
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-gray-100",
        className
      )}
    >
      {previewDataUrl ? (
        <img
          src={previewDataUrl}
          alt={`${selectedColor.name} ${selectedView.name} preview`}
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div
            className="h-3/4 w-3/4 rounded-lg border-2 border-gray-300"
            style={{ backgroundColor: selectedColor.hex }}
          >
            {selectedColor.value === "white" && (
              <div className="h-full w-full rounded-lg border border-gray-300"></div>
            )}
          </div>
        </div>
      )}

      {/* View Label */}
      <div className="absolute bottom-2 left-2 rounded bg-black bg-opacity-75 px-2 py-1 text-xs text-white">
        {selectedView.name}
      </div>

      {/* Color Label */}
      <div className="absolute right-2 top-2 rounded bg-black bg-opacity-75 px-2 py-1 text-xs text-white">
        {selectedColor.name}
      </div>
    </div>
  );
}
