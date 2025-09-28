"use client";

import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Type, Heading1, Heading2, Quote, Hash } from "lucide-react";

interface TextPresetsProps {
  canvas: fabric.Canvas | null;
  onTextAdd?: () => void;
}

const textPresets = [
  {
    id: "heading1",
    name: "Heading 1",
    icon: Heading1,
    style: {
      fontSize: 36,
      fontWeight: "bold",
      fontFamily: "Arial",
      fill: "#000000",
    },
    text: "Heading",
  },
  {
    id: "heading2",
    name: "Heading 2",
    icon: Heading2,
    style: {
      fontSize: 28,
      fontWeight: "bold",
      fontFamily: "Arial",
      fill: "#333333",
    },
    text: "Subheading",
  },
  {
    id: "body",
    name: "Body Text",
    icon: Type,
    style: {
      fontSize: 16,
      fontWeight: "normal",
      fontFamily: "Arial",
      fill: "#000000",
    },
    text: "Body text",
  },
  {
    id: "quote",
    name: "Quote",
    icon: Quote,
    style: {
      fontSize: 20,
      fontWeight: "normal",
      fontFamily: "Georgia",
      fontStyle: "italic",
      fill: "#666666",
    },
    text: '"Quote text"',
  },
  {
    id: "hashtag",
    name: "Hashtag",
    icon: Hash,
    style: {
      fontSize: 18,
      fontWeight: "bold",
      fontFamily: "Arial",
      fill: "#1DA1F2",
    },
    text: "#hashtag",
  },
];

export function TextPresets({ canvas, onTextAdd }: TextPresetsProps) {
  const addPresetText = (preset: (typeof textPresets)[0]) => {
    if (!canvas) return;

    const text = new fabric.IText(preset.text, {
      left: 280,
      top: 250,
      editable: true,
      ...preset.style,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    canvas.renderAll();
    onTextAdd?.();
  };

  return (
    <div className="p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-900">Text Presets</h3>
      <div className="space-y-2">
        {textPresets.map((preset) => {
          const Icon = preset.icon;
          return (
            <Button
              key={preset.id}
              variant="outline"
              className="h-auto w-full justify-start p-3"
              onClick={() => addPresetText(preset)}
            >
              <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">{preset.name}</div>
                <div
                  className="mt-1 text-xs text-gray-500"
                  style={{
                    fontSize: Math.min(preset.style.fontSize / 2, 12),
                    fontWeight: preset.style.fontWeight,
                    fontFamily: preset.style.fontFamily,
                    fontStyle: preset.style.fontStyle,
                  }}
                >
                  {preset.text}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
