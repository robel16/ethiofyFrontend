"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductPricing } from "@/types";
import { ShoppingCart, Info } from "lucide-react";

interface PricingDisplayProps {
  pricing: ProductPricing | null;
  onAddToCart?: () => void;
  isAddingToCart?: boolean;
}

export function PricingDisplay({
  pricing,
  onAddToCart,
  isAddingToCart,
}: PricingDisplayProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!pricing) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-sm text-gray-500">Loading pricing...</div>
        </div>
      </div>
    );
  }

  const unitPrice =
    pricing.basePrice +
    pricing.colorModifier +
    pricing.sizeModifier +
    pricing.customizationFee;
  const subtotal = unitPrice * pricing.quantity;
  const bulkDiscount = pricing.bulkDiscounts.find(
    (d) => pricing.quantity >= d.minQuantity && d.discountAmount > 0
  );
  const savings = bulkDiscount?.discountAmount || 0;

  return (
    <div className="flex items-center space-x-4">
      {/* Pricing Summary */}
      <div className="text-right">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-gray-900">
            ${pricing.totalPrice.toFixed(2)}
          </span>

          {savings > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Save ${savings.toFixed(2)}
            </Badge>
          )}

          <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Pricing Breakdown</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>${pricing.basePrice.toFixed(2)}</span>
                </div>

                {pricing.colorModifier !== 0 && (
                  <div className="flex justify-between">
                    <span>Color Upgrade:</span>
                    <span>+${pricing.colorModifier.toFixed(2)}</span>
                  </div>
                )}

                {pricing.sizeModifier !== 0 && (
                  <div className="flex justify-between">
                    <span>Size Upgrade:</span>
                    <span>+${pricing.sizeModifier.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Customization Fee:</span>
                  <span>+${pricing.customizationFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-medium">
                  <span>Unit Price:</span>
                  <span>${unitPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>×{pricing.quantity}</span>
                </div>

                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {bulkDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Bulk Discount ({bulkDiscount.discountPercentage}%):
                    </span>
                    <span>-${bulkDiscount.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total:</span>
                  <span>${pricing.totalPrice.toFixed(2)}</span>
                </div>

                {pricing.quantity >= 5 && (
                  <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <h4 className="mb-2 font-medium text-blue-900">
                      Bulk Pricing Available
                    </h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      {pricing.bulkDiscounts.map((discount, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{discount.minQuantity}+ items:</span>
                          <span>{discount.discountPercentage}% off</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-sm text-gray-500">
          {pricing.quantity > 1 ? (
            <>
              ${unitPrice.toFixed(2)} each × {pricing.quantity}
              {savings > 0 && (
                <span className="ml-1 text-green-600">
                  (bulk discount applied)
                </span>
              )}
            </>
          ) : (
            "Includes customization"
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={onAddToCart}
        disabled={isAddingToCart}
        className="bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {isAddingToCart ? "Adding..." : "Add to Cart"}
      </Button>
    </div>
  );
}
