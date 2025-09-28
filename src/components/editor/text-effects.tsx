"use client";

import { useState } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Shadow, Circle, Square, Zap } from "lucide-react";

interface TextEffectsProps {
  canvas: fabric.Canvas | null;
  selectedElement: fabric.Object | null;
  onEffectChange?: () => void;
}

export function TextEffects({
  canvas,
  selectedElement,
  onEffectChange,
}: TextEffectsProps) {
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [strokeEnabled, setStrokeEnabled] = useState(false);

  const isTextElement =
    selectedElement &&
    (selectedElement.type === "i-text" ||
      selectedElement.type === "text" ||
      selectedElement.type === "textbox");

  if (!isTextElement) return null;

  const textObj = selectedElement as fabric.IText;

  const addShadow = () => {
    if (!canvas) return;

    textObj.set({
      shadow: new fabric.Shadow({
        color: "rgba(0,0,0,0.3)",
        blur: 5,
        offsetX: 3,
        offsetY: 3,
      }),
    });

    setShadowEnabled(true);
    canvas.renderAll();
    onEffectChange?.();
  };

  const removeShadow = () => {
    if (!canvas) return;

    textObj.set({ shadow: null });
    setShadowEnabled(false);
    canvas.renderAll();
    onEffectChange?.();
  };

  const addStroke = () => {
    if (!canvas) return;

    textObj.set({
      stroke: "#000000",
      strokeWidth: 2,
    });

    setStrokeEnabled(true);
    canvas.renderAll();
    onEffectChange?.();
  };

  const removeStroke = () => {
    if (!canvas) return;

    textObj.set({
      stroke: "",
      strokeWidth: 0,
    });

    setStrokeEnabled(false);
    canvas.renderAll();
    onEffectChange?.();
  };

  const updateStrokeWidth = (width: number) => {
    if (!canvas) return;

    textObj.set({ strokeWidth: width });
    canvas.renderAll();
    onEffectChange?.();
  };

  const updateStrokeColor = (color: string) => {
    if (!canvas) return;

    textObj.set({ stroke: color });
    canvas.renderAll();
    onEffectChange?.();
  };

  const applyTextEffect = (effect: string) => {
    if (!canvas) return;

    switch (effect) {
      case "bold-shadow":
        textObj.set({
          fontWeight: "bold",
          shadow: new fabric.Shadow({
            color: "rgba(0,0,0,0.5)",
            blur: 8,
            offsetX: 4,
            offsetY: 4,
          }),
        });
        break;
      case "outline":
        textObj.set({
          stroke: "#000000",
          strokeWidth: 3,
          fill: "transparent",
        });
        break;
      case "glow":
        textObj.set({
          shadow: new fabric.Shadow({
            color: (textObj.fill as string) || "#000000",
            blur: 15,
            offsetX: 0,
            offsetY: 0,
          }),
        });
        break;
      case "emboss":
        textObj.set({
          shadow: new fabric.Shadow({
            color: "rgba(255,255,255,0.8)",
            blur: 0,
            offsetX: 1,
            offsetY: 1,
          }),
        });
        break;
      default:
        break;
    }

    canvas.renderAll();
    onEffectChange?.();
  };

  const strokeColors = [
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

  return (
    <div className="border-t border-gray-200 p-4">
      <h3 className="mb-4 flex items-center text-sm font-medium text-gray-900">
        <Sparkles className="mr-2 h-4 w-4" />
        Text Effects
      </h3>

      {/* Quick Effects */}
      <div className="mb-4 space-y-2">
        <Label className="text-xs font-medium text-gray-700">
          Quick Effects
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyTextEffect("bold-shadow")}
            className="text-xs"
          >
            <Shadow className="mr-1 h-3 w-3" />
            Bold Shadow
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyTextEffect("outline")}
            className="text-xs"
          >
            <Circle className="mr-1 h-3 w-3" />
            Outline
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyTextEffect("glow")}
            className="text-xs"
          >
            <Zap className="mr-1 h-3 w-3" />
            Glow
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyTextEffect("emboss")}
            className="text-xs"
          >
            <Square className="mr-1 h-3 w-3" />
            Emboss
          </Button>
        </div>
      </div>

      {/* Shadow Controls */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-gray-700">
            Drop Shadow
          </Label>
          <div className="flex space-x-2">
            <Button
              variant={shadowEnabled ? "default" : "outline"}
              size="sm"
              onClick={addShadow}
              className="px-2 py-1 text-xs"
            >
              Add
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={removeShadow}
              className="px-2 py-1 text-xs"
            >
              Remove
            </Button>
          </div>
        </div>
      </div>

      {/* Stroke Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-gray-700">Stroke</Label>
          <div className="flex space-x-2">
            <Button
              variant={strokeEnabled ? "default" : "outline"}
              size="sm"
              onClick={addStroke}
              className="px-2 py-1 text-xs"
            >
              Add
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={removeStroke}
              className="px-2 py-1 text-xs"
            >
              Remove
            </Button>
          </div>
        </div>

        {strokeEnabled && (
          <>
            <div>
              <Label className="text-xs font-medium text-gray-700">
                Stroke Width
              </Label>
              <Slider
                value={[textObj.strokeWidth || 0]}
                onValueChange={([value]) => updateStrokeWidth(value)}
                max={10}
                min={1}
                step={1}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">
                Stroke Color
              </Label>
              <div className="mt-2 grid grid-cols-5 gap-1">
                {strokeColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateStrokeColor(color)}
                    className="h-6 w-6 rounded border border-gray-300 transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
