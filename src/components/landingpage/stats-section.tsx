"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

const stats = [
  {
    value: 50000,
    suffix: "+",
    label: "Products Created",
    description: "Custom designs brought to life",
  },
  {
    value: 200,
    suffix: "+",
    label: "Print Providers",
    description: "Verified partners worldwide",
  },
  {
    value: 99.9,
    suffix: "%",
    label: "Uptime",
    description: "Reliable service guarantee",
  },
  {
    value: 24,
    suffix: "h",
    label: "Avg. Production",
    description: "From order to shipping",
  },
];

function AnimatedCounter({
  value,
  suffix,
  duration = 2000,
}: {
  value: number;
  suffix: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className="text-gradient text-4xl font-bold lg:text-5xl">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="bg-secondary/10 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border-border bg-card/50 p-6 text-center backdrop-blur-sm"
            >
              <div className="mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <h3 className="mb-1 font-semibold">{stat.label}</h3>
              <p className="text-sm text-muted-foreground">
                {stat.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
