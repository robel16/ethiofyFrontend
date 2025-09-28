"use client";

import { useState, useEffect } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MoveUp,
  MoveDown,
} from "lucide-react";

interface DesignElementManagerProps {
  canvas: fabric.Canvas | null;
  selectedElement: fabric.Object | null;
  onElementChange?: () => void;
}

export function DesignElementManager({
  canvas,
  selectedElement,
  onElementChange,
}: DesignElementManagerProps) {
  const [elements, setElements] = useState<fabric.Object[]>([]);
  const [elementProperties, setElementProperties] = useState<any>({});

  // Update elements list when canvas changes
  useEffect(() => {
    if (!canvas) return;

    const updateElements = () => {
      const objects = canvas
        .getObjects()
        .filter((obj) => !obj.excludeFromExport);
      setElements(objects);
    };

    updateElements();

    canvas.on("object:added", updateElements);
    canvas.on("object:removed", updateElements);
    canvas.on("object:modified", updateElements);

    return () => {
      canvas.off("object:added", updateElements);
      canvas.off("object:removed", updateElements);
      canvas.off("object:modified", updateElements);
    };
  }, [canvas]);

  // Update properties when selected element changes
  useEffect(() => {
    if (selectedElement) {
      setElementProperties({
        opacity: selectedElement.opacity || 1,
        angle: selectedElement.angle || 0,
        left: Math.round(selectedElement.left || 0),
        top: Math.round(selectedElement.top || 0),
        scaleX: selectedElement.scaleX || 1,
        scaleY: selectedElement.scaleY || 1,
        visible: selectedElement.visible !== false,
        selectable: selectedElement.selectable !== false,
      });
    }
  }, [selectedElement]);

  const deleteElement = (element: fabric.Object) => {
    if (canvas) {
      canvas.remove(element);
      canvas.renderAll();
      onElementChange?.();
    }
  };

  const duplicateElement = (element: fabric.Object) => {
    if (canvas) {
      element.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (cloned.left || 0) + 10,
          top: (cloned.top || 0) + 10,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
        onElementChange?.();
      });
    }
  };

  const toggleVisibility = (element: fabric.Object) => {
    element.set("visible", !element.visible);
    canvas?.renderAll();
    onElementChange?.();
  };

  const toggleLock = (element: fabric.Object) => {
    const isLocked = !element.selectable;
    element.set({
      selectable: isLocked,
      evented: isLocked,
    });
    canvas?.renderAll();
    onElementChange?.();
  };

  const moveLayer = (element: fabric.Object, direction: "up" | "down") => {
    if (!canvas) return;

    if (direction === "up") {
      canvas.bringForward(element);
    } else {
      canvas.sendBackwards(element);
    }
    canvas.renderAll();
    onElementChange?.();
  };

  const updateElementProperty = (property: string, value: any) => {
    if (!selectedElement || !canvas) return;

    selectedElement.set(property, value);
    canvas.renderAll();
    setElementProperties((prev) => ({ ...prev, [property]: value }));
    onElementChange?.();
  };

  const getElementName = (element: fabric.Object) => {
    if (element.type === "i-text" || element.type === "text") {
      const text = (element as fabric.IText).text || "Text";
      return text.length > 15 ? text.substring(0, 15) + "..." : text;
    }
    return (
      element.type?.charAt(0).toUpperCase() + element.type?.slice(1) ||
      "Element"
    );
  };

  return (
    <div className="flex w-80 flex-col border-l border-gray-200 bg-white">
      {/* Layer Management */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Layers</h3>
        <div className="max-h-60 space-y-2 overflow-y-auto">
          {elements.map((element, index) => (
            <div
              key={index}
              className={`flex items-center justify-between rounded border p-2 ${
                selectedElement === element
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => canvas?.setActiveObject(element)}
            >
              <div className="flex flex-1 items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  {getElementName(element)}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(element);
                  }}
                  className="h-6 w-6 p-0"
                >
                  {element.visible !== false ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock(element);
                  }}
                  className="h-6 w-6 p-0"
                >
                  {element.selectable !== false ? (
                    <Unlock className="h-3 w-3" />
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayer(element, "up");
                  }}
                  className="h-6 w-6 p-0"
                >
                  <MoveUp className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayer(element, "down");
                  }}
                  className="h-6 w-6 p-0"
                >
                  <MoveDown className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateElement(element);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteElement(element);
                  }}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {elements.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500">
              No design elements yet
            </div>
          )}
        </div>
      </div>

      {/* Element Properties */}
      {selectedElement && (
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Properties
          </h3>

          <div className="space-y-4">
            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="left" className="text-sm">
                  X Position
                </Label>
                <Input
                  id="left"
                  type="number"
                  value={elementProperties.left || 0}
                  onChange={(e) =>
                    updateElementProperty("left", parseInt(e.target.value))
                  }
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="top" className="text-sm">
                  Y Position
                </Label>
                <Input
                  id="top"
                  type="number"
                  value={elementProperties.top || 0}
                  onChange={(e) =>
                    updateElementProperty("top", parseInt(e.target.value))
                  }
                  className="h-8"
                />
              </div>
            </div>

            {/* Opacity */}
            <div>
              <Label className="text-sm">Opacity</Label>
              <div className="mt-2">
                <Slider
                  value={[elementProperties.opacity * 100]}
                  onValueChange={([value]) =>
                    updateElementProperty("opacity", value / 100)
                  }
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="mt-1 text-xs text-gray-500">
                  {Math.round(elementProperties.opacity * 100)}%
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div>
              <Label className="text-sm">Rotation</Label>
              <div className="mt-2">
                <Slider
                  value={[elementProperties.angle]}
                  onValueChange={([value]) =>
                    updateElementProperty("angle", value)
                  }
                  max={180}
                  min={-180}
                  step={1}
                  className="w-full"
                />
                <div className="mt-1 text-xs text-gray-500">
                  {Math.round(elementProperties.angle)}°
                </div>
              </div>
            </div>

            {/* Scale */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm">Scale X</Label>
                <div className="mt-2">
                  <Slider
                    value={[elementProperties.scaleX * 100]}
                    onValueChange={([value]) =>
                      updateElementProperty("scaleX", value / 100)
                    }
                    max={300}
                    min={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {Math.round(elementProperties.scaleX * 100)}%
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm">Scale Y</Label>
                <div className="mt-2">
                  <Slider
                    value={[elementProperties.scaleY * 100]}
                    onValueChange={([value]) =>
                      updateElementProperty("scaleY", value / 100)
                    }
                    max={300}
                    min={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {Math.round(elementProperties.scaleY * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
