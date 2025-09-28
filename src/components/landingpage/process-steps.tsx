"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Palette, Eye, Rocket, Zap } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Pick Your Product",
    description:
      "Choose from 1000+ premium products. Select based on quality, price, and location for optimal shipping.",
    icon: Search,
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    title: "Design & Customize",
    description:
      "Use our advanced design tools or upload your artwork. Preview in 3D and make perfect adjustments.",
    icon: Palette,
    color: "from-purple-500 to-pink-500",
  },
  {
    number: "03",
    title: "Preview & Sample",
    description:
      "View your product in photorealistic mockups. Order samples to ensure perfect quality before launch.",
    icon: Eye,
    color: "from-green-500 to-emerald-500",
  },
  {
    number: "04",
    title: "Connect Provider",
    description:
      "Choose your preferred print provider directly. No middleman, better prices, faster communication.",
    icon: Zap,
    color: "from-orange-500 to-red-500",
  },
  {
    number: "05",
    title: "Launch & Earn",
    description:
      "Start selling immediately. Orders go directly to your chosen provider for automatic fulfillment.",
    icon: Rocket,
    color: "from-indigo-500 to-purple-500",
  },
];

export function ProcessSteps() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-24 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Launch Your Business in 5 Simple Steps
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            From idea to profit in minutes. Our streamlined process makes it
            easy to start selling custom products.
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-5">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-0 bg-white shadow-lg transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl dark:bg-gray-800"
                >
                  <CardContent className="p-8 text-center">
                    <div
                      className={`mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-r ${step.color} flex transform items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                    >
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>

                    <div className="mb-4 text-6xl font-bold text-gray-100 transition-colors group-hover:text-gray-200 dark:text-gray-700">
                      {step.number}
                    </div>

                    <h3 className="mb-4 text-xl font-bold transition-colors group-hover:text-purple-600">
                      {step.title}
                    </h3>

                    <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                      {step.description}
                    </p>
                  </CardContent>

                  {index < steps.length - 1 && (
                    <div className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 transform lg:block">
                      <ArrowRight className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              className="transform rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:to-blue-700 hover:shadow-xl"
            >
              Start Your Journey Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
