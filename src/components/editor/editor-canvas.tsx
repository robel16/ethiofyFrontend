"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { SnapAlignmentSystem } from "./snap-alignment-system";

interface EditorCanvasProps {
  productId: string;
  selectedTool: string;
  selectedVariant: {
    color: string;
    size: string;
    view: string;
  };
  onElementSelect?: (element: fabric.Object | null) => void;
  onCanvasChange?: () => void;
}

export const EditorCanvas = forwardRef<fabric.Canvas | null, EditorCanvasProps>(
  (
    {
      productId,
      selectedTool,
      selectedVariant,
      onElementSelect,
      onCanvasChange,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const [zoom, setZoom] = useState(1);
    const [showGrid, setShowGrid] = useState(true);
    const [snapEnabled, setSnapEnabled] = useState(true);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Initialize Fabric.js canvas
    useEffect(() => {
      if (!canvasRef.current) return;

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 600,
        height: 600,
        backgroundColor: "#f8f9fa",
        selection: true,
        preserveObjectStacking: true,
      });

      fabricCanvasRef.current = canvas;

      // Expose canvas through ref
      if (ref) {
        if (typeof ref === "function") {
          ref(canvas);
        } else {
          ref.current = canvas;
        }
      }

      // Add product mockup background
      addProductMockup(canvas);

      // Canvas event listeners
      canvas.on("selection:created", (e) => {
        onElementSelect?.(e.selected?.[0] || null);
      });

      canvas.on("selection:updated", (e) => {
        onElementSelect?.(e.selected?.[0] || null);
      });

      canvas.on("selection:cleared", () => {
        onElementSelect?.(null);
      });

      canvas.on("object:modified", () => {
        saveState();
        onCanvasChange?.();
      });

      canvas.on("object:added", () => {
        onCanvasChange?.();
      });

      canvas.on("object:removed", () => {
        onCanvasChange?.();
      });

      // Initialize history
      saveState();

      return () => {
        canvas.dispose();
      };
    }, []);

    // Update product mockup when variant changes
    useEffect(() => {
      if (fabricCanvasRef.current) {
        updateProductMockup(fabricCanvasRef.current);
        // Trigger canvas change to update pricing
        onCanvasChange?.();
      }
    }, [selectedVariant, onCanvasChange]);

    // Handle tool changes
    useEffect(() => {
      if (!fabricCanvasRef.current) return;

      const canvas = fabricCanvasRef.current;

      switch (selectedTool) {
        case "select":
          canvas.isDrawingMode = false;
          canvas.selection = true;
          canvas.defaultCursor = "default";
          break;
        case "text":
          canvas.isDrawingMode = false;
          canvas.selection = false;
          canvas.defaultCursor = "text";
          break;
        case "image":
          canvas.isDrawingMode = false;
          canvas.selection = false;
          canvas.defaultCursor = "crosshair";
          break;
        case "shape":
          canvas.isDrawingMode = false;
          canvas.selection = false;
          canvas.defaultCursor = "crosshair";
          break;
        default:
          canvas.isDrawingMode = false;
          canvas.selection = true;
          canvas.defaultCursor = "default";
      }
    }, [selectedTool]);

    const addProductMockup = (canvas: fabric.Canvas) => {
      // Create product background shape (t-shirt)
      const productBg = new fabric.Rect({
        left: 150,
        top: 125,
        width: 300,
        height: 350,
        fill:
          selectedVariant.color === "white" ? "#ffffff" : selectedVariant.color,
        stroke: "#e5e7eb",
        strokeWidth: 2,
        selectable: false,
        evented: false,
        excludeFromExport: false,
      });

      // Create design area outline
      const designArea = new fabric.Rect({
        left: 240,
        top: 220,
        width: 120,
        height: 160,
        fill: "transparent",
        stroke: "#3b82f6",
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });

      canvas.add(productBg, designArea);
      canvas.renderAll();
    };

    const updateProductMockup = (canvas: fabric.Canvas) => {
      const objects = canvas.getObjects();
      const productBg = objects.find(
        (obj) => obj.type === "rect" && !obj.excludeFromExport
      );

      if (productBg) {
        // Map color names to hex values
        const colorMap: Record<string, string> = {
          white: "#ffffff",
          black: "#000000",
          navy: "#1e3a8a",
          red: "#dc2626",
          green: "#16a34a",
          gray: "#6b7280",
        };

        const colorHex =
          colorMap[selectedVariant.color] || selectedVariant.color;
        productBg.set("fill", colorHex);

        // Update stroke for better visibility on light colors
        if (selectedVariant.color === "white") {
          productBg.set("stroke", "#e5e7eb");
        } else {
          productBg.set("stroke", "#374151");
        }

        canvas.renderAll();
      }
    };

    const saveState = useCallback(() => {
      if (!fabricCanvasRef.current) return;

      const state = JSON.stringify(fabricCanvasRef.current.toJSON());
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(state);

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const undo = () => {
      if (historyIndex > 0 && fabricCanvasRef.current) {
        const prevIndex = historyIndex - 1;
        const state = history[prevIndex];

        fabricCanvasRef.current.loadFromJSON(state, () => {
          fabricCanvasRef.current?.renderAll();
          setHistoryIndex(prevIndex);
        });
      }
    };

    const redo = () => {
      if (historyIndex < history.length - 1 && fabricCanvasRef.current) {
        const nextIndex = historyIndex + 1;
        const state = history[nextIndex];

        fabricCanvasRef.current.loadFromJSON(state, () => {
          fabricCanvasRef.current?.renderAll();
          setHistoryIndex(nextIndex);
        });
      }
    };

    const handleZoomIn = () => {
      if (fabricCanvasRef.current) {
        const newZoom = Math.min(zoom * 1.2, 3);
        fabricCanvasRef.current.setZoom(newZoom);
        setZoom(newZoom);
      }
    };

    const handleZoomOut = () => {
      if (fabricCanvasRef.current) {
        const newZoom = Math.max(zoom / 1.2, 0.3);
        fabricCanvasRef.current.setZoom(newZoom);
        setZoom(newZoom);
      }
    };

    const handleFitToScreen = () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.setZoom(1);
        fabricCanvasRef.current.absolutePan({ x: 0, y: 0 });
        setZoom(1);
      }
    };

    const toggleGrid = () => {
      setShowGrid(!showGrid);
      setSnapEnabled(!showGrid); // Toggle snap with grid
    };

    const handleCanvasClick = (event: fabric.IEvent) => {
      if (!fabricCanvasRef.current) return;

      const pointer = fabricCanvasRef.current.getPointer(event.e);

      switch (selectedTool) {
        case "text":
          addText(pointer.x, pointer.y);
          break;
        case "shape":
          addShape(pointer.x, pointer.y);
          break;
        default:
          break;
      }
    };

    const addText = (x: number, y: number) => {
      if (!fabricCanvasRef.current) return;

      // Check if click is within design area
      const designArea = {
        left: 240,
        top: 220,
        width: 120,
        height: 160,
      };

      const isInDesignArea =
        x >= designArea.left &&
        x <= designArea.left + designArea.width &&
        y >= designArea.top &&
        y <= designArea.top + designArea.height;

      if (!isInDesignArea) {
        // Show warning or move text to design area
        x = designArea.left + designArea.width / 2;
        y = designArea.top + designArea.height / 2;
      }

      const text = new fabric.IText("Click to edit", {
        left: x - 50,
        top: y - 10,
        fontFamily: "Arial",
        fontSize: 20,
        fill: "#000000",
        editable: true,
        width: 100,
        splitByGrapheme: true, // Better text wrapping
      });

      // Add text validation for printable area
      text.on("changed", () => {
        validateTextPosition(text);
      });

      text.on("moving", () => {
        validateTextPosition(text);
      });

      fabricCanvasRef.current.add(text);
      fabricCanvasRef.current.setActiveObject(text);
      text.enterEditing();
      saveState();
    };

    const validateTextPosition = (textObj: fabric.IText) => {
      if (!fabricCanvasRef.current) return;

      const designArea = {
        left: 240,
        top: 220,
        width: 120,
        height: 160,
      };

      const textBounds = textObj.getBoundingRect();

      // Check if text exceeds design area
      const exceedsLeft = textBounds.left < designArea.left;
      const exceedsRight =
        textBounds.left + textBounds.width > designArea.left + designArea.width;
      const exceedsTop = textBounds.top < designArea.top;
      const exceedsBottom =
        textBounds.top + textBounds.height > designArea.top + designArea.height;

      if (exceedsLeft || exceedsRight || exceedsTop || exceedsBottom) {
        // Add visual warning or constraint
        textObj.set({
          stroke: "#ff0000",
          strokeWidth: 1,
        });
      } else {
        textObj.set({
          stroke: "",
          strokeWidth: 0,
        });
      }

      fabricCanvasRef.current.renderAll();
    };

    const addShape = (x: number, y: number) => {
      if (!fabricCanvasRef.current) return;

      const rect = new fabric.Rect({
        left: x - 25,
        top: y - 25,
        width: 50,
        height: 50,
        fill: "#3b82f6",
        stroke: "#1e40af",
        strokeWidth: 2,
      });

      fabricCanvasRef.current.add(rect);
      fabricCanvasRef.current.setActiveObject(rect);
      saveState();
    };

    const validateImagePosition = (imgObj: fabric.Image) => {
      if (!fabricCanvasRef.current) return;

      const designArea = {
        left: 240,
        top: 220,
        width: 120,
        height: 160,
      };

      const imgBounds = imgObj.getBoundingRect();

      // Check if image exceeds design area
      const exceedsLeft = imgBounds.left < designArea.left;
      const exceedsRight =
        imgBounds.left + imgBounds.width > designArea.left + designArea.width;
      const exceedsTop = imgBounds.top < designArea.top;
      const exceedsBottom =
        imgBounds.top + imgBounds.height > designArea.top + designArea.height;

      if (exceedsLeft || exceedsRight || exceedsTop || exceedsBottom) {
        // Add visual warning
        imgObj.set({
          stroke: "#ff0000",
          strokeWidth: 2,
        });
      } else {
        imgObj.set({
          stroke: "",
          strokeWidth: 0,
        });
      }

      fabricCanvasRef.current.renderAll();
    };

    // Add image validation when images are moved or scaled
    useEffect(() => {
      if (!fabricCanvasRef.current) return;

      const handleObjectMoving = (e: fabric.IEvent) => {
        if (e.target && e.target.type === "image") {
          validateImagePosition(e.target as fabric.Image);
        }
      };

      const handleObjectScaling = (e: fabric.IEvent) => {
        if (e.target && e.target.type === "image") {
          validateImagePosition(e.target as fabric.Image);
        }
      };

      fabricCanvasRef.current.on("object:moving", handleObjectMoving);
      fabricCanvasRef.current.on("object:scaling", handleObjectScaling);

      return () => {
        fabricCanvasRef.current?.off("object:moving", handleObjectMoving);
        fabricCanvasRef.current?.off("object:scaling", handleObjectScaling);
      };
    }, []);

    // Add canvas click handler
    useEffect(() => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.on("mouse:down", handleCanvasClick);

        return () => {
          fabricCanvasRef.current?.off("mouse:down", handleCanvasClick);
        };
      }
    }, [selectedTool]);

    return (
      <div className="flex flex-1 flex-col bg-gray-100">
        {/* Snap Alignment System */}
        {fabricCanvasRef.current && (
          <SnapAlignmentSystem
            canvas={fabricCanvasRef.current}
            enabled={snapEnabled}
            gridSize={10}
            snapTolerance={5}
            showAlignmentGuides={true}
          />
        )}

        {/* Canvas Controls */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="min-w-[60px] text-center text-sm text-gray-600">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleFitToScreen}>
                <Maximize className="h-4 w-4" />
              </Button>
              <Button
                variant={showGrid ? "default" : "outline"}
                size="sm"
                onClick={toggleGrid}
                title={`${showGrid ? "Hide" : "Show"} grid and snap`}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <canvas
              ref={canvasRef}
              className="rounded border border-gray-300"
            />

            <div className="mt-4 text-center text-sm text-gray-500">
              {selectedVariant.view} view • {selectedVariant.color} •{" "}
              {selectedVariant.size}
              {snapEnabled && (
                <span className="ml-2 text-blue-600">• Snap enabled</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

EditorCanvas.displayName = "EditorCanvas";
