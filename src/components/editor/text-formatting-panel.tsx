"use client";

import { useState, useEffect } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TextPresets } from "./text-presets";
import { TextEffects } from "./text-effects";

interface TextFormattingPanelProps {
  canvas: fabric.Canvas | null;
  selectedElement: fabric.Object | null;
  onTextChange?: () => void;
}

const fonts = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Courier New",
  "Impact",
  "Comic Sans MS",
  "Trebuchet MS",
  "Arial Black",
  "Palatino",
  "Garamond",
  "Bookman",
  "Avant Garde",
];

const textColors = [
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
  "#008000",
  "#800000",
  "#000080",
  "#808080",
  "#c0c0c0",
];

export function TextFormattingPanel({
  canvas,
  selectedElement,
  onTextChange,
}: TextFormattingPanelProps) {
  const [textProperties, setTextProperties] = useState({
    text: "",
    fontFamily: "Arial",
    fontSize: 20,
    fill: "#000000",
    fontWeight: "normal",
    fontStyle: "normal",
    underline: false,
    textAlign: "left",
    lineHeight: 1.2,
    charSpacing: 0,
  });

  const isTextElement =
    selectedElement &&
    (selectedElement.type === "i-text" ||
      selectedElement.type === "text" ||
      selectedElement.type === "textbox");

  // Update properties when selected element changes
  useEffect(() => {
    if (isTextElement) {
      const textObj = selectedElement as fabric.IText;
      setTextProperties({
        text: textObj.text || "",
        fontFamily: textObj.fontFamily || "Arial",
        fontSize: textObj.fontSize || 20,
        fill: (textObj.fill as string) || "#000000",
        fontWeight: textObj.fontWeight || "normal",
        fontStyle: textObj.fontStyle || "normal",
        underline: textObj.underline || false,
        textAlign: textObj.textAlign || "left",
        lineHeight: textObj.lineHeight || 1.2,
        charSpacing: textObj.charSpacing || 0,
      });
    }
  }, [selectedElement, isTextElement]);

  const updateTextProperty = (property: string, value: any) => {
    if (!isTextElement || !canvas) return;

    const textObj = selectedElement as fabric.IText;
    textObj.set(property, value);
    canvas.renderAll();

    setTextProperties((prev) => ({ ...prev, [property]: value }));
    onTextChange?.();
  };

  const addNewText = () => {
    if (!canvas) return;

    const text = new fabric.IText("Click to edit", {
      left: 100,
      top: 100,
      fontFamily: "Arial",
      fontSize: 20,
      fill: "#000000",
      editable: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    canvas.renderAll();
    onTextChange?.();
  };

  const toggleBold = () => {
    const newWeight = textProperties.fontWeight === "bold" ? "normal" : "bold";
    updateTextProperty("fontWeight", newWeight);
  };

  const toggleItalic = () => {
    const newStyle =
      textProperties.fontStyle === "italic" ? "normal" : "italic";
    updateTextProperty("fontStyle", newStyle);
  };

  const toggleUnderline = () => {
    updateTextProperty("underline", !textProperties.underline);
  };

  const setTextAlign = (align: string) => {
    updateTextProperty("textAlign", align);
  };

  if (!isTextElement) {
    return (
      <div>
        <div className="border-b border-gray-200 p-4 text-center">
          <Type className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-4 text-gray-500">
            Select a text element to edit formatting
          </p>
          <Button onClick={addNewText} className="w-full">
            <Type className="mr-2 h-4 w-4" />
            Add Text
          </Button>
        </div>
        <TextPresets canvas={canvas} onTextAdd={onTextChange} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Text Formatting
        </h3>
      </div>

      {/* Text Content */}
      <div>
        <Label htmlFor="text-content" className="text-sm font-medium">
          Text Content
        </Label>
        <Input
          id="text-content"
          value={textProperties.text}
          onChange={(e) => updateTextProperty("text", e.target.value)}
          placeholder="Enter text..."
          className="mt-1"
        />
      </div>

      {/* Font Family */}
      <div>
        <Label className="text-sm font-medium">Font Family</Label>
        <Select
          value={textProperties.fontFamily}
          onValueChange={(value) => updateTextProperty("fontFamily", value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((font) => (
              <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div>
        <Label className="text-sm font-medium">Font Size</Label>
        <div className="mt-2">
          <Slider
            value={[textProperties.fontSize]}
            onValueChange={([value]) => updateTextProperty("fontSize", value)}
            max={120}
            min={8}
            step={1}
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>8px</span>
            <span>{textProperties.fontSize}px</span>
            <span>120px</span>
          </div>
        </div>
      </div>

      {/* Text Style Buttons */}
      <div>
        <Label className="text-sm font-medium">Style</Label>
        <div className="mt-2 flex space-x-2">
          <Button
            variant={
              textProperties.fontWeight === "bold" ? "default" : "outline"
            }
            size="sm"
            onClick={toggleBold}
            className="flex-1"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={
              textProperties.fontStyle === "italic" ? "default" : "outline"
            }
            size="sm"
            onClick={toggleItalic}
            className="flex-1"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={textProperties.underline ? "default" : "outline"}
            size="sm"
            onClick={toggleUnderline}
            className="flex-1"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <Label className="text-sm font-medium">Alignment</Label>
        <div className="mt-2 flex space-x-2">
          <Button
            variant={
              textProperties.textAlign === "left" ? "default" : "outline"
            }
            size="sm"
            onClick={() => setTextAlign("left")}
            className="flex-1"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={
              textProperties.textAlign === "center" ? "default" : "outline"
            }
            size="sm"
            onClick={() => setTextAlign("center")}
            className="flex-1"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={
              textProperties.textAlign === "right" ? "default" : "outline"
            }
            size="sm"
            onClick={() => setTextAlign("right")}
            className="flex-1"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Text Color */}
      <div>
        <Label className="flex items-center text-sm font-medium">
          <Palette className="mr-2 h-4 w-4" />
          Text Color
        </Label>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {textColors.map((color) => (
            <button
              key={color}
              onClick={() => updateTextProperty("fill", color)}
              className={cn(
                "h-10 w-10 rounded border-2 transition-transform hover:scale-110",
                textProperties.fill === color
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-300"
              )}
              style={{ backgroundColor: color }}
              title={color}
            >
              {color === "#ffffff" && (
                <div className="h-full w-full rounded border border-gray-300"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div>
        <Label className="text-sm font-medium">Line Height</Label>
        <div className="mt-2">
          <Slider
            value={[textProperties.lineHeight]}
            onValueChange={([value]) => updateTextProperty("lineHeight", value)}
            max={3}
            min={0.5}
            step={0.1}
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>0.5</span>
            <span>{textProperties.lineHeight.toFixed(1)}</span>
            <span>3.0</span>
          </div>
        </div>
      </div>

      {/* Character Spacing */}
      <div>
        <Label className="text-sm font-medium">Character Spacing</Label>
        <div className="mt-2">
          <Slider
            value={[textProperties.charSpacing]}
            onValueChange={([value]) =>
              updateTextProperty("charSpacing", value)
            }
            max={1000}
            min={-200}
            step={10}
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>-200</span>
            <span>{textProperties.charSpacing}</span>
            <span>1000</span>
          </div>
        </div>
      </div>

      {/* Text Effects */}
      <TextEffects
        canvas={canvas}
        selectedElement={selectedElement}
        onEffectChange={onTextChange}
      />

      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-4">
        <Button onClick={addNewText} variant="outline" className="w-full">
          <Type className="mr-2 h-4 w-4" />
          Add New Text
        </Button>
      </div>
    </div>
  );
}
