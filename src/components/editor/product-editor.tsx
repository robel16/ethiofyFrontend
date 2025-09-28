"use client";

import { useState, useRef } from "react";
import { fabric } from "fabric";
import { EditorHeader } from "./editor-header";
import { EditorCanvas } from "./editor-canvas";
import { EditorSidebar } from "./editor-sidebar";
import { ProductOptions } from "./product-options";
import { DesignElementManager } from "./design-element-manager";
import { ProductPricing } from "@/types";
import toast from "react-hot-toast";

interface ProductEditorProps {
  productId: string;
}

export function ProductEditor({ productId }: ProductEditorProps) {
  const [selectedTool, setSelectedTool] = useState<string>("select");
  const [selectedVariant, setSelectedVariant] = useState({
    color: "white",
    size: "m",
    view: "front",
  });
  const [selectedElement, setSelectedElement] = useState<fabric.Object | null>(
    null
  );
  const [showElementManager, setShowElementManager] = useState(false);
  const [pricing, setPricing] = useState<ProductPricing | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const canvasRef = useRef<fabric.Canvas | null>(null);

  const handleCanvasChange = () => {
    // Handle canvas changes for autosave, pricing updates, etc.
    console.log("Canvas changed");
  };

  const handleVariantChange = (variant: {
    color: string;
    size: string;
    view: string;
  }) => {
    setSelectedVariant(variant);

    // Show toast notification for variant change
    toast.success(
      `Switched to ${variant.color} ${variant.size.toUpperCase()} - ${variant.view} view`
    );
  };

  const handlePricingChange = (newPricing: ProductPricing) => {
    setPricing(newPricing);
  };

  const handleAddToCart = async () => {
    if (!pricing) {
      toast.error("Pricing information not available");
      return;
    }

    setIsAddingToCart(true);

    try {
      // Here you would typically save the design and add to cart
      // For now, we'll simulate the process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(
        `Added ${pricing.quantity} item(s) to cart for $${pricing.totalPrice.toFixed(2)}`
      );
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error("Add to cart error:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <EditorHeader
        productId={productId}
        selectedVariant={selectedVariant}
        pricing={pricing}
        onToggleElementManager={() =>
          setShowElementManager(!showElementManager)
        }
        showElementManager={showElementManager}
        onAddToCart={handleAddToCart}
        isAddingToCart={isAddingToCart}
      />

      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
          canvas={canvasRef.current}
          selectedElement={selectedElement}
        />

        <div className="flex flex-1 flex-col">
          <EditorCanvas
            productId={productId}
            selectedTool={selectedTool}
            selectedVariant={selectedVariant}
            onElementSelect={setSelectedElement}
            onCanvasChange={handleCanvasChange}
            ref={canvasRef}
          />
        </div>

        {showElementManager ? (
          <DesignElementManager
            canvas={canvasRef.current}
            selectedElement={selectedElement}
            onElementChange={handleCanvasChange}
          />
        ) : (
          <ProductOptions
            productId={productId}
            selectedVariant={selectedVariant}
            onVariantChange={handleVariantChange}
            onPricingChange={handlePricingChange}
          />
        )}
      </div>
    </div>
  );
}
