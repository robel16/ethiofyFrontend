"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const products = [
  { name: "T-shirt", cost: 8.77, image: "/white-tshirt-transparent.jpg" },
  { name: "Hoodie", cost: 15.65, image: "/black-hoodie-transparent.jpg" },
  { name: "Mug", cost: 5.12, image: "/coffee-mug-transparent.jpg" },
  { name: "Phone Case", cost: 10.73, image: "/phone-case-transparent.jpg" },
  { name: "Tote Bag", cost: 12.5, image: "/tote-bag-transparent.jpg" },
];

export function ProfitCalculator() {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [sellPrice, setSellPrice] = useState(25);
  const [dailySales, setDailySales] = useState(5);

  const profit = sellPrice - selectedProduct.cost;
  const monthlyEarnings = profit * dailySales * 30;

  return (
    <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-24 dark:from-purple-950/20 dark:to-blue-950/20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent">
            Calculate Your Earnings
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            See how much you could earn with our direct-to-provider model
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <Card className="overflow-hidden border-0 bg-white/80 shadow-2xl backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="grid items-center gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="product"
                      className="text-base font-semibold"
                    >
                      Select Product
                    </Label>
                    <Select
                      value={selectedProduct.name}
                      onValueChange={(value) => {
                        const product = products.find((p) => p.name === value);
                        if (product) setSelectedProduct(product);
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.name} value={product.name}>
                            {product.name} - ${product.cost}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-base font-semibold">
                      Sell it for: ${sellPrice}
                    </Label>
                    <Input
                      id="price"
                      type="range"
                      min={selectedProduct.cost + 1}
                      max={100}
                      value={sellPrice}
                      onChange={(e) => setSellPrice(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sales" className="text-base font-semibold">
                      Daily sales: {dailySales}
                    </Label>
                    <Input
                      id="sales"
                      type="range"
                      min={1}
                      max={50}
                      value={dailySales}
                      onChange={(e) => setDailySales(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>

                  <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-green-600">
                        Your Monthly Earnings
                      </p>
                      <p className="text-4xl font-bold text-green-700">
                        ${monthlyEarnings.toFixed(2)}
                      </p>
                      <p className="mt-1 text-sm text-green-600">
                        Profit per item: ${profit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="group relative">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400 to-blue-400 opacity-30 blur-xl transition-opacity group-hover:opacity-50"></div>
                    <img
                      src={selectedProduct.image || "/placeholder.svg"}
                      alt={selectedProduct.name}
                      className="relative h-80 w-80 transform rounded-2xl object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
