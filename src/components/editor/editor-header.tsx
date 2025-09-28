"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PricingDisplay } from "./pricing-display";
import { Save, ArrowLeft, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProductPricing } from "@/types";

interface EditorHeaderProps {
  productId: string;
  selectedVariant: {
    color: string;
    size: string;
    view: string;
  };
  pricing?: ProductPricing | null;
  onToggleElementManager?: () => void;
  showElementManager?: boolean;
  onAddToCart?: () => void;
  isAddingToCart?: boolean;
}

export function EditorHeader({
  productId,
  selectedVariant,
  pricing,
  onToggleElementManager,
  showElementManager,
  onAddToCart,
  isAddingToCart,
}: EditorHeaderProps) {
  const router = useRouter();

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving design...");
  };

  const getVariantDisplayName = () => {
    const colorName =
      selectedVariant.color.charAt(0).toUpperCase() +
      selectedVariant.color.slice(1);
    const sizeName = selectedVariant.size.toUpperCase();
    const viewName =
      selectedVariant.view.charAt(0).toUpperCase() +
      selectedVariant.view.slice(1);

    return `${colorName} • ${sizeName} • ${viewName}`;
  };

  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Product Editor
            </h1>
            <div className="mt-1 flex items-center space-x-2">
              <p className="text-sm text-gray-500">{getVariantDisplayName()}</p>
              {pricing && pricing.quantity > 1 && (
                <Badge variant="secondary" className="text-xs">
                  Qty: {pricing.quantity}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant={showElementManager ? "default" : "outline"}
            onClick={onToggleElementManager}
            className="flex items-center space-x-2"
          >
            <Layers className="h-4 w-4" />
            <span>Layers</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleSave}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </Button>

          <PricingDisplay
            pricing={pricing}
            onAddToCart={onAddToCart}
            isAddingToCart={isAddingToCart}
          />
        </div>
      </div>
    </header>
  );
}
