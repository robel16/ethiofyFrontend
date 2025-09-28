"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { cn } from "@/lib/utils";
import {
  ProductService,
  ProductDetails,
  VariantSelection,
} from "@/services/product.service";
import {
  ProductColor,
  ProductSize,
  ProductView,
  ProductPricing,
} from "@/types";
import { Check, X, AlertCircle, Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";

interface ProductOptionsProps {
  productId: string;
  selectedVariant: {
    color: string;
    size: string;
    view: string;
  };
  onVariantChange: (variant: {
    color: string;
    size: string;
    view: string;
  }) => void;
  onPricingChange?: (pricing: ProductPricing) => void;
}

export function ProductOptions({
  productId,
  selectedVariant,
  onVariantChange,
  onPricingChange,
}: ProductOptionsProps) {
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [pricing, setPricing] = useState<ProductPricing | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const productService = ProductService.getInstance();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (product) {
      updatePricing();
    }
  }, [selectedVariant, quantity, product]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProduct(productId);
      setProduct(productData);
      setPricing(productData.pricing);
    } catch (error) {
      toast.error("Failed to load product options");
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePricing = async () => {
    if (!product) return;

    try {
      const selection: VariantSelection = {
        colorId: selectedVariant.color,
        sizeId: selectedVariant.size,
        viewId: selectedVariant.view,
        quantity,
      };

      const newPricing = await productService.getVariantPricing(
        productId,
        selection
      );
      setPricing(newPricing);
      onPricingChange?.(newPricing);
    } catch (error) {
      console.error("Error updating pricing:", error);
    }
  };

  const handleColorChange = async (colorId: string) => {
    setAvailabilityChecking(true);

    try {
      const isAvailable = await productService.checkVariantAvailability(
        productId,
        colorId,
        selectedVariant.size
      );

      if (!isAvailable) {
        toast.error("This color combination is currently unavailable");
        return;
      }

      onVariantChange({ ...selectedVariant, color: colorId });
    } catch (error) {
      console.error("Error checking availability:", error);
    } finally {
      setAvailabilityChecking(false);
    }
  };

  const handleSizeChange = async (sizeId: string) => {
    setAvailabilityChecking(true);

    try {
      const isAvailable = await productService.checkVariantAvailability(
        productId,
        selectedVariant.color,
        sizeId
      );

      if (!isAvailable) {
        toast.error("This size combination is currently unavailable");
        return;
      }

      onVariantChange({ ...selectedVariant, size: sizeId });
    } catch (error) {
      console.error("Error checking availability:", error);
    } finally {
      setAvailabilityChecking(false);
    }
  };

  const handleViewChange = (viewId: string) => {
    onVariantChange({ ...selectedVariant, view: viewId });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 100) {
      setQuantity(newQuantity);
    }
  };

  const getApplicableBulkDiscount = () => {
    if (!pricing) return null;

    return pricing.bulkDiscounts
      .filter((discount) => quantity >= discount.minQuantity)
      .pop();
  };

  if (loading) {
    return (
      <div className="flex w-80 items-center justify-center border-l border-gray-200 bg-white p-8">
        <Loading />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex w-80 items-center justify-center border-l border-gray-200 bg-white p-8">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">Failed to load product options</p>
        </div>
      </div>
    );
  }

  const selectedColor = product.colors.find(
    (c) => c.id === selectedVariant.color
  );
  const selectedSize = product.sizes.find((s) => s.id === selectedVariant.size);
  const selectedView = product.views.find((v) => v.id === selectedVariant.view);
  const bulkDiscount = getApplicableBulkDiscount();

  return (
    <div className="flex w-80 flex-col border-l border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Product Options</h2>
        <p className="mt-1 text-sm text-gray-500">{product.name}</p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Colors */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Colors</h3>
            {selectedColor && (
              <Badge variant="secondary" className="text-xs">
                {selectedColor.name}
                {selectedColor.priceModifier !== 0 && (
                  <span className="ml-1">
                    {selectedColor.priceModifier > 0 ? "+" : ""}$
                    {selectedColor.priceModifier}
                  </span>
                )}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.colors.map((color) => (
              <button
                key={color.id}
                onClick={() => handleColorChange(color.id)}
                disabled={!color.isAvailable || availabilityChecking}
                className={cn(
                  "relative flex h-14 w-14 items-center justify-center rounded-lg border-2 transition-all",
                  selectedVariant.color === color.id
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-300 hover:border-gray-400",
                  !color.isAvailable && "cursor-not-allowed opacity-50"
                )}
                style={{ backgroundColor: color.hex }}
                title={`${color.name}${!color.isAvailable ? " (Unavailable)" : ""}`}
              >
                {color.value === "white" && (
                  <div className="h-10 w-10 rounded border border-gray-300"></div>
                )}

                {selectedVariant.color === color.id && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}

                {!color.isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <X className="h-6 w-6 text-red-500" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Sizes</h3>
            {selectedSize && (
              <Badge variant="secondary" className="text-xs">
                {selectedSize.name}
                {selectedSize.priceModifier !== 0 && (
                  <span className="ml-1">
                    {selectedSize.priceModifier > 0 ? "+" : ""}$
                    {selectedSize.priceModifier}
                  </span>
                )}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {product.sizes.map((size) => (
              <Button
                key={size.id}
                variant={
                  selectedVariant.size === size.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleSizeChange(size.id)}
                disabled={!size.isAvailable || availabilityChecking}
                className={cn(
                  "relative h-10",
                  !size.isAvailable && "cursor-not-allowed opacity-50"
                )}
                title={`${size.name}${!size.isAvailable ? " (Unavailable)" : ""}`}
              >
                {size.value}
                {!size.isAvailable && (
                  <X className="absolute -right-1 -top-1 h-3 w-3 text-red-500" />
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Views */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Views</h3>
            {selectedView && (
              <Badge variant="secondary" className="text-xs">
                {selectedView.name}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {product.views.map((view) => (
              <Button
                key={view.id}
                variant={
                  selectedVariant.view === view.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleViewChange(view.id)}
                className="h-10 capitalize"
              >
                {view.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <Label className="mb-3 block text-sm font-medium text-gray-900">
            Quantity
          </Label>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="h-10 w-10 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Input
              type="number"
              value={quantity}
              onChange={(e) =>
                handleQuantityChange(parseInt(e.target.value) || 1)
              }
              className="h-10 w-20 text-center"
              min="1"
              max="100"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= 100}
              className="h-10 w-10 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {bulkDiscount && (
            <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-2">
              <p className="text-xs font-medium text-green-800">
                🎉 {bulkDiscount.discountPercentage}% bulk discount applied!
              </p>
              <p className="text-xs text-green-600">
                Save ${bulkDiscount.discountAmount?.toFixed(2)} on this order
              </p>
            </div>
          )}
        </div>

        {/* Pricing */}
        {pricing && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="mb-3 text-sm font-medium text-gray-900">Pricing</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span>${pricing.basePrice.toFixed(2)}</span>
              </div>

              {pricing.colorModifier !== 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Color:</span>
                  <span>+${pricing.colorModifier.toFixed(2)}</span>
                </div>
              )}

              {pricing.sizeModifier !== 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span>+${pricing.sizeModifier.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Customization:</span>
                <span>+${pricing.customizationFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span>×{pricing.quantity}</span>
              </div>

              {bulkDiscount && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Bulk Discount ({bulkDiscount.discountPercentage}%):
                  </span>
                  <span>-${bulkDiscount.discountAmount?.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-semibold">
                <span>Total:</span>
                <span>${pricing.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Product Details */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="mb-2 text-sm font-medium text-gray-900">
            Product Details
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Material: 100% Cotton</p>
            <p>Weight: 180 GSM</p>
            {selectedSize?.dimensions && (
              <p>
                Print Area: {selectedSize.dimensions.printArea.width}" ×{" "}
                {selectedSize.dimensions.printArea.height}"
              </p>
            )}
          </div>
        </div>

        {/* Bulk Pricing Info */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="mb-2 text-sm font-medium text-gray-900">
            Bulk Discounts
          </h3>
          <div className="space-y-1 text-xs text-gray-600">
            {pricing?.bulkDiscounts.map((discount, index) => (
              <div key={index} className="flex justify-between">
                <span>{discount.minQuantity}+ items:</span>
                <span className="text-green-600">
                  {discount.discountPercentage}% off
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
