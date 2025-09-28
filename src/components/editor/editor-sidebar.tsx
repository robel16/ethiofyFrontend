"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MousePointer,
  Type,
  Image,
  Square,
  Upload,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fabric } from "fabric";
import { TextFormattingPanel } from "./text-formatting-panel";
import { ImageUpload } from "./image-upload";
import { ImageManipulation } from "./image-manipulation";
import { ImageLibrary } from "./image-library";
import { ImageQualityValidator } from "./image-quality-validator";
import { ImageCropper } from "./image-cropper";
import { useState } from "react";

interface EditorSidebarProps {
  selectedTool: string;
  onToolChange: (tool: string) => void;
  canvas: fabric.Canvas | null;
  selectedElement: fabric.Object | null;
}

const tools = [
  { id: "select", label: "Select", icon: MousePointer },
  { id: "text", label: "Text", icon: Type },
  { id: "image", label: "Image", icon: Image },
  { id: "shape", label: "Shape", icon: Square },
  { id: "upload", label: "Upload", icon: Upload },
];

const colors = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
  "#ffa500",
  "#800080",
];

export function EditorSidebar({
  selectedTool,
  onToolChange,
  canvas,
  selectedElement,
}: EditorSidebarProps) {
  const [showCropper, setShowCropper] = useState(false);
  const [croppingImage, setCroppingImage] = useState<fabric.Image | null>(null);
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imgUrl = e.target?.result as string;
      fabric.Image.fromURL(imgUrl, (img) => {
        img.set({
          left: 100,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const changeElementColor = (color: string) => {
    if (!selectedElement || !canvas) return;

    if (selectedElement.type === "i-text" || selectedElement.type === "text") {
      selectedElement.set("fill", color);
    } else {
      selectedElement.set("fill", color);
    }
    canvas.renderAll();
  };

  const handleCropStart = (image: fabric.Image) => {
    setCroppingImage(image);
    setShowCropper(true);
  };

  const handleCropComplete = (croppedImage: fabric.Image) => {
    setShowCropper(false);
    setCroppingImage(null);
    // The cropped image is already added to canvas in the cropper component
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCroppingImage(null);
  };
  return (
    <div className="flex w-80 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Design Tools</h2>
      </div>

      <div className="space-y-2 border-b border-gray-200 p-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                selectedTool === tool.id &&
                  "border-blue-200 bg-blue-50 text-blue-700"
              )}
              onClick={() => onToolChange(tool.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {tool.label}
            </Button>
          );
        })}
      </div>

      {/* Text Formatting Panel */}
      {(selectedTool === "text" ||
        (selectedElement &&
          (selectedElement.type === "i-text" ||
            selectedElement.type === "text" ||
            selectedElement.type === "textbox"))) && (
        <div className="flex-1 overflow-y-auto">
          <TextFormattingPanel
            canvas={canvas}
            selectedElement={selectedElement}
            onTextChange={() => {
              /* Handle text changes */
            }}
          />
        </div>
      )}

      {/* Image Upload Panel */}
      {selectedTool === "upload" && (
        <div className="flex-1 overflow-y-auto">
          <ImageUpload
            canvas={canvas}
            onImageAdd={() => {
              /* Handle image add */
            }}
            onUploadComplete={() => {
              /* Handle upload complete */
            }}
          />
        </div>
      )}

      {/* Image Manipulation Panel */}
      {selectedTool === "image" && (
        <div className="flex-1 overflow-y-auto">
          <ImageLibrary
            canvas={canvas}
            onImageAdd={() => {
              /* Handle image add */
            }}
          />
        </div>
      )}

      {/* Image Properties Panel for selected images */}
      {selectedElement && selectedElement.type === "image" && (
        <div className="flex-1 overflow-y-auto">
          <ImageManipulation
            canvas={canvas}
            selectedElement={selectedElement}
            onImageChange={() => {
              /* Handle image change */
            }}
          />
        </div>
      )}

      {/* Default tool content for other tools */}
      {selectedTool !== "text" &&
        selectedTool !== "upload" &&
        selectedTool !== "image" &&
        !(
          selectedElement &&
          (selectedElement.type === "i-text" ||
            selectedElement.type === "text" ||
            selectedElement.type === "textbox" ||
            selectedElement.type === "image")
        ) && (
          <div className="flex-1 overflow-y-auto">
            {/* Tool-specific options */}
            {selectedTool === "upload" && (
              <div className="border-t border-gray-200 p-4">
                <label className="block">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      document.querySelector('input[type="file"]')?.click()
                    }
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </label>
              </div>
            )}

            {/* Tool-specific options */}
            {selectedTool === "upload" && (
              <div className="border-t border-gray-200 p-4">
                <label className="block">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      document.querySelector('input[type="file"]')?.click()
                    }
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </label>
              </div>
            )}

            {/* Color picker for non-text selected elements */}
            {selectedElement &&
              !(
                selectedElement.type === "i-text" ||
                selectedElement.type === "text" ||
                selectedElement.type === "textbox"
              ) && (
                <div className="border-t border-gray-200 p-4">
                  <h3 className="mb-3 flex items-center text-sm font-medium text-gray-900">
                    <Palette className="mr-2 h-4 w-4" />
                    Colors
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => changeElementColor(color)}
                        className="h-8 w-8 rounded border-2 border-gray-300 hover:border-gray-400"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
    </div>
  );
}
