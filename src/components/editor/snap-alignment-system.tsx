"use client";

import { useEffect, useRef } from "react";
import { fabric } from "fabric";

interface SnapAlignmentSystemProps {
  canvas: fabric.Canvas;
  enabled: boolean;
  gridSize?: number;
  snapTolerance?: number;
  showAlignmentGuides?: boolean;
}

interface AlignmentGuide {
  line: fabric.Line;
  type: "vertical" | "horizontal";
  position: number;
}

export function SnapAlignmentSystem({
  canvas,
  enabled,
  gridSize = 10,
  snapTolerance = 5,
  showAlignmentGuides = true,
}: SnapAlignmentSystemProps) {
  const alignmentGuidesRef = useRef<AlignmentGuide[]>([]);
  const gridLinesRef = useRef<fabric.Line[]>([]);

  useEffect(() => {
    if (!enabled) {
      clearAlignmentGuides();
      clearGrid();
      return;
    }

    setupSnapToGrid();
    setupAlignmentGuides();

    return () => {
      clearAlignmentGuides();
      clearGrid();
    };
  }, [enabled, gridSize, snapTolerance, showAlignmentGuides]);

  const setupSnapToGrid = () => {
    if (!canvas) return;

    // Create grid lines
    createGrid();

    // Add snap-to-grid functionality
    canvas.on("object:moving", handleObjectMoving);
    canvas.on("object:scaling", handleObjectScaling);
    canvas.on("object:rotating", handleObjectRotating);

    return () => {
      canvas.off("object:moving", handleObjectMoving);
      canvas.off("object:scaling", handleObjectScaling);
      canvas.off("object:rotating", handleObjectRotating);
    };
  };

  const createGrid = () => {
    clearGrid();

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const gridLines: fabric.Line[] = [];

    // Create vertical grid lines
    for (let i = 0; i <= canvasWidth; i += gridSize) {
      const line = new fabric.Line([i, 0, i, canvasHeight], {
        stroke: "#e5e7eb",
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        excludeFromExport: true,
        opacity: 0.3,
      });
      gridLines.push(line);
      canvas.add(line);
    }

    // Create horizontal grid lines
    for (let i = 0; i <= canvasHeight; i += gridSize) {
      const line = new fabric.Line([0, i, canvasWidth, i], {
        stroke: "#e5e7eb",
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        excludeFromExport: true,
        opacity: 0.3,
      });
      gridLines.push(line);
      canvas.add(line);
    }

    gridLinesRef.current = gridLines;
    canvas.sendToBack(...gridLines);
  };

  const clearGrid = () => {
    gridLinesRef.current.forEach((line) => {
      canvas.remove(line);
    });
    gridLinesRef.current = [];
  };

  const setupAlignmentGuides = () => {
    if (!canvas || !showAlignmentGuides) return;

    canvas.on("object:moving", showAlignmentGuidesOnMove);
    canvas.on("selection:cleared", clearAlignmentGuides);
    canvas.on("selection:updated", clearAlignmentGuides);

    return () => {
      canvas.off("object:moving", showAlignmentGuidesOnMove);
      canvas.off("selection:cleared", clearAlignmentGuides);
      canvas.off("selection:updated", clearAlignmentGuides);
    };
  };

  const handleObjectMoving = (e: fabric.IEvent) => {
    if (!e.target) return;

    const obj = e.target;
    const objBounds = obj.getBoundingRect();

    // Snap to grid
    const snappedLeft = Math.round(objBounds.left / gridSize) * gridSize;
    const snappedTop = Math.round(objBounds.top / gridSize) * gridSize;

    // Check if within snap tolerance
    if (Math.abs(objBounds.left - snappedLeft) <= snapTolerance) {
      obj.set("left", snappedLeft);
    }
    if (Math.abs(objBounds.top - snappedTop) <= snapTolerance) {
      obj.set("top", snappedTop);
    }

    // Snap to other objects
    snapToObjects(obj);
  };

  const handleObjectScaling = (e: fabric.IEvent) => {
    if (!e.target) return;

    const obj = e.target;
    const objBounds = obj.getBoundingRect();

    // Snap width and height to grid
    const snappedWidth = Math.round(objBounds.width / gridSize) * gridSize;
    const snappedHeight = Math.round(objBounds.height / gridSize) * gridSize;

    if (Math.abs(objBounds.width - snappedWidth) <= snapTolerance) {
      const scaleX = snappedWidth / (obj.width || 1);
      obj.set("scaleX", scaleX);
    }
    if (Math.abs(objBounds.height - snappedHeight) <= snapTolerance) {
      const scaleY = snappedHeight / (obj.height || 1);
      obj.set("scaleY", scaleY);
    }
  };

  const handleObjectRotating = (e: fabric.IEvent) => {
    if (!e.target) return;

    const obj = e.target;
    const angle = obj.angle || 0;

    // Snap to 15-degree increments
    const snapAngle = Math.round(angle / 15) * 15;

    if (Math.abs(angle - snapAngle) <= 5) {
      obj.set("angle", snapAngle);
    }
  };

  const snapToObjects = (movingObj: fabric.Object) => {
    const objects = canvas
      .getObjects()
      .filter(
        (obj) =>
          obj !== movingObj &&
          obj.selectable !== false &&
          !obj.excludeFromExport
      );

    const movingBounds = movingObj.getBoundingRect();
    let snapped = false;

    objects.forEach((obj) => {
      const objBounds = obj.getBoundingRect();

      // Horizontal alignment
      const leftAlign = Math.abs(movingBounds.left - objBounds.left);
      const rightAlign = Math.abs(
        movingBounds.left +
          movingBounds.width -
          objBounds.left -
          objBounds.width
      );
      const centerAlignH = Math.abs(
        movingBounds.left +
          movingBounds.width / 2 -
          objBounds.left -
          objBounds.width / 2
      );

      // Vertical alignment
      const topAlign = Math.abs(movingBounds.top - objBounds.top);
      const bottomAlign = Math.abs(
        movingBounds.top +
          movingBounds.height -
          objBounds.top -
          objBounds.height
      );
      const centerAlignV = Math.abs(
        movingBounds.top +
          movingBounds.height / 2 -
          objBounds.top -
          objBounds.height / 2
      );

      // Apply snapping
      if (leftAlign <= snapTolerance) {
        movingObj.set("left", objBounds.left);
        snapped = true;
      } else if (rightAlign <= snapTolerance) {
        movingObj.set(
          "left",
          objBounds.left + objBounds.width - movingBounds.width
        );
        snapped = true;
      } else if (centerAlignH <= snapTolerance) {
        movingObj.set(
          "left",
          objBounds.left + objBounds.width / 2 - movingBounds.width / 2
        );
        snapped = true;
      }

      if (topAlign <= snapTolerance) {
        movingObj.set("top", objBounds.top);
        snapped = true;
      } else if (bottomAlign <= snapTolerance) {
        movingObj.set(
          "top",
          objBounds.top + objBounds.height - movingBounds.height
        );
        snapped = true;
      } else if (centerAlignV <= snapTolerance) {
        movingObj.set(
          "top",
          objBounds.top + objBounds.height / 2 - movingBounds.height / 2
        );
        snapped = true;
      }
    });

    if (snapped) {
      canvas.renderAll();
    }
  };

  const showAlignmentGuidesOnMove = (e: fabric.IEvent) => {
    if (!e.target || !showAlignmentGuides) return;

    clearAlignmentGuides();

    const movingObj = e.target;
    const movingBounds = movingObj.getBoundingRect();
    const objects = canvas
      .getObjects()
      .filter(
        (obj) =>
          obj !== movingObj &&
          obj.selectable !== false &&
          !obj.excludeFromExport
      );

    const guides: AlignmentGuide[] = [];

    objects.forEach((obj) => {
      const objBounds = obj.getBoundingRect();

      // Check for horizontal alignment
      const leftAlign = Math.abs(movingBounds.left - objBounds.left);
      const rightAlign = Math.abs(
        movingBounds.left +
          movingBounds.width -
          objBounds.left -
          objBounds.width
      );
      const centerAlignH = Math.abs(
        movingBounds.left +
          movingBounds.width / 2 -
          objBounds.left -
          objBounds.width / 2
      );

      // Check for vertical alignment
      const topAlign = Math.abs(movingBounds.top - objBounds.top);
      const bottomAlign = Math.abs(
        movingBounds.top +
          movingBounds.height -
          objBounds.top -
          objBounds.height
      );
      const centerAlignV = Math.abs(
        movingBounds.top +
          movingBounds.height / 2 -
          objBounds.top -
          objBounds.height / 2
      );

      // Create vertical guides
      if (leftAlign <= snapTolerance) {
        const line = new fabric.Line(
          [objBounds.left, 0, objBounds.left, canvas.getHeight()],
          {
            stroke: "#ff0000",
            strokeWidth: 1,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
            excludeFromExport: true,
          }
        );
        canvas.add(line);
        guides.push({ line, type: "vertical", position: objBounds.left });
      } else if (rightAlign <= snapTolerance) {
        const x = objBounds.left + objBounds.width;
        const line = new fabric.Line([x, 0, x, canvas.getHeight()], {
          stroke: "#ff0000",
          strokeWidth: 1,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });
        canvas.add(line);
        guides.push({ line, type: "vertical", position: x });
      } else if (centerAlignH <= snapTolerance) {
        const x = objBounds.left + objBounds.width / 2;
        const line = new fabric.Line([x, 0, x, canvas.getHeight()], {
          stroke: "#ff0000",
          strokeWidth: 1,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });
        canvas.add(line);
        guides.push({ line, type: "vertical", position: x });
      }

      // Create horizontal guides
      if (topAlign <= snapTolerance) {
        const line = new fabric.Line(
          [0, objBounds.top, canvas.getWidth(), objBounds.top],
          {
            stroke: "#ff0000",
            strokeWidth: 1,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
            excludeFromExport: true,
          }
        );
        canvas.add(line);
        guides.push({ line, type: "horizontal", position: objBounds.top });
      } else if (bottomAlign <= snapTolerance) {
        const y = objBounds.top + objBounds.height;
        const line = new fabric.Line([0, y, canvas.getWidth(), y], {
          stroke: "#ff0000",
          strokeWidth: 1,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });
        canvas.add(line);
        guides.push({ line, type: "horizontal", position: y });
      } else if (centerAlignV <= snapTolerance) {
        const y = objBounds.top + objBounds.height / 2;
        const line = new fabric.Line([0, y, canvas.getWidth(), y], {
          stroke: "#ff0000",
          strokeWidth: 1,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });
        canvas.add(line);
        guides.push({ line, type: "horizontal", position: y });
      }
    });

    alignmentGuidesRef.current = guides;
    canvas.renderAll();
  };

  const clearAlignmentGuides = () => {
    alignmentGuidesRef.current.forEach((guide) => {
      canvas.remove(guide.line);
    });
    alignmentGuidesRef.current = [];
    canvas.renderAll();
  };

  // This component doesn't render anything visible
  return null;
}
