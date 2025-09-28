"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="magnetic-button ripple-effect relative h-10 w-10 overflow-hidden rounded-full"
    >
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isDark ? "rotate-180 opacity-0" : "rotate-0 opacity-100"}`}
      >
        <Sun className="h-4 w-4" />
      </div>
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isDark ? "rotate-0 opacity-100" : "-rotate-180 opacity-0"}`}
      >
        <Moon className="h-4 w-4" />
      </div>
    </Button>
  );
}
