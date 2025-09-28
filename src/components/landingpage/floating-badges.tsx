"use client";

import { Badge } from "@/components/ui/badge";
import { DollarSign, Globe, Zap } from "lucide-react";

const badges = [
  {
    icon: DollarSign,
    text: "Best Price",
    position: "top-4 right-8",
    delay: "0s",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  {
    icon: Globe,
    text: "Global",
    position: "bottom-12 left-4",
    delay: "1s",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    icon: Zap,
    text: "Fast",
    position: "top-20 left-12",
    delay: "2s",
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
];

export function FloatingBadges() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <Badge
            key={index}
            className={`absolute ${badge.position} ${badge.color} animate-float glow-purple pointer-events-auto cursor-pointer transition-transform hover:scale-110`}
            style={{
              animationDelay: badge.delay,
              animationDuration: "3s",
            }}
          >
            <Icon className="animate-wiggle mr-1 h-3 w-3" />
            {badge.text}
          </Badge>
        );
      })}
    </div>
  );
}
