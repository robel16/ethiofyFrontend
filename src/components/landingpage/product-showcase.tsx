"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const products = [
  {
    name: "T-Shirts",
    image: "/white-tshirt-transparent.jpg",
    category: "Apparel",
    startingPrice: "$12.99",
  },
  {
    name: "Hoodies",
    image: "/black-hoodie-transparent.jpg",
    category: "Apparel",
    startingPrice: "$24.99",
  },
  {
    name: "Mugs",
    image: "/coffee-mug-transparent.jpg",
    category: "Drinkware",
    startingPrice: "$8.99",
  },
  {
    name: "Phone Cases",
    image: "/phone-case-transparent.jpg",
    category: "Accessories",
    startingPrice: "$15.99",
  },
  {
    name: "Stickers",
    image: "/sticker-sheet-transparent.jpg",
    category: "Accessories",
    startingPrice: "$3.99",
  },
  {
    name: "Tote Bags",
    image: "/tote-bag-transparent.jpg",
    category: "Accessories",
    startingPrice: "$9.99",
  },
];

export function ProductShowcase() {
  return (
    <section id="products" className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
            Your next bestseller <span className="text-gradient">awaits</span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
            From apparel to accessories, create custom products that your
            customers will love.
          </p>
        </div>

        <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {products.map((product, index) => (
            <Card
              key={index}
              className="group cursor-pointer border-border bg-card/80 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-card hover:shadow-lg"
            >
              <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-muted/30 to-muted/10">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <Badge
                variant="secondary"
                className="mb-2 bg-secondary/50 text-xs"
              >
                {product.category}
              </Badge>
              <h3 className="mb-1 font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                From {product.startingPrice}
              </p>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <button className="group inline-flex items-center text-primary transition-colors hover:text-primary/80">
            View all products
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
