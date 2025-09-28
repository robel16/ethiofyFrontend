"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

const designs = [
  {
    title: "FUTURE VIBES",
    color: "from-purple-500 to-pink-500",
    pattern: "🌟",
    image: "../../public/black-hoodie-mockup.jpg",
  },
  {
    title: "NEON DREAMS",
    color: "from-cyan-500 to-blue-500",
    pattern: "⚡",
    image: "../../public/black-hoodie-transparent.jpg",
  },
  {
    title: "RETRO WAVE",
    color: "from-orange-500 to-red-500",
    pattern: "🔥",
    image: "/white-tshirt-transparent.jpg",
  },
  {
    title: "COSMIC FLOW",
    color: "from-green-500 to-teal-500",
    pattern: "🚀",
    image: "/black-hoodie-transparent.jpg",
  },
];

export function AnimatedTshirt() {
  const [currentDesign, setCurrentDesign] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentDesign((prev) => (prev + 1) % designs.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const design = designs[currentDesign];

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="animate-float tilt-hover relative">
        <div className="relative mx-auto h-96 w-80">
          <div className="glow-on-hover h-full w-full overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={design.image || "/placeholder.svg"}
              alt={design.title}
              className="h-full w-full object-contain transition-transform duration-500 hover:scale-105"
            />

            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                isAnimating
                  ? "translate-y-full rotate-12 transform opacity-0"
                  : "translate-y-0 rotate-0 transform opacity-100"
              }`}
            >
              <Card
                className={`h-20 w-32 bg-gradient-to-r ${design.color} magnetic-button scale-on-hover flex items-center justify-center rounded-lg text-xs font-bold text-white shadow-lg`}
              >
                <div className="text-center">
                  <div className="animate-wiggle mb-1 text-2xl">
                    {design.pattern}
                  </div>
                  <div>{design.title}</div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="animate-pulse-glow absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl" />
      </div>

      <div className="mt-6 flex justify-center space-x-2">
        {designs.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentDesign(index)}
            className={`magnetic-button h-2 rounded-full transition-all duration-300 ${
              index === currentDesign
                ? "glow-purple w-6 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
