"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface Product {
  id: number;
  name: string;
  brand: string;
  sku?: string;
  price: number;
  premiumPrice?: number;
  image: string;
  rating?: number;
  orders?: number;
}

interface ProductCarouselProps {
  products: Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4;

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev + itemsPerView >= products.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, products.length - itemsPerView) : prev - 1
    );
  };

  const visibleProducts = products.slice(
    currentIndex,
    currentIndex + itemsPerView
  );

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="h-8 w-8 bg-transparent p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentIndex + itemsPerView >= products.length}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-1">
          {Array.from({
            length: Math.ceil(products.length / itemsPerView),
          }).map((_, index) => (
            <div
              key={index}
              className={`h-1 w-8 rounded-full transition-colors ${
                Math.floor(currentIndex / itemsPerView) === index
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {visibleProducts.map((product) => (
          <Card
            key={product.id}
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg"
          >
            <CardContent className="p-4">
              {/* Product Image */}
              <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-gray-50">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                {product.orders && (
                  <Badge className="absolute right-2 top-2 bg-green-100 text-xs text-green-800">
                    {product.orders.toLocaleString()} sold
                  </Badge>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold leading-tight text-gray-900">
                  {product.name}
                </h3>

                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>By {product.brand}</span>
                  {product.sku && (
                    <>
                      <span>•</span>
                      <span>{product.sku}</span>
                    </>
                  )}
                </div>

                {product.rating && (
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(product.rating!)
                              ? "fill-current text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">
                      ({product.rating})
                    </span>
                  </div>
                )}

                {/* Pricing */}
                <div className="space-y-1">
                  <p className="text-sm font-bold">From USD {product.price}</p>
                  {product.premiumPrice && (
                    <p className="text-xs text-gray-600">
                      From USD {product.premiumPrice} with Printify Premium
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
