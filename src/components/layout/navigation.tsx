"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface NavigationItem {
  title: string;
  href: string;
  description?: string;
}

interface NavigationProps {
  items: NavigationItem[];
  className?: string;
}

export function Navigation({ items, className }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center space-x-6", className)}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href ? "text-primary" : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

export function MobileNavigation({ items }: { items: NavigationItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col space-y-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex flex-col space-y-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <span>{item.title}</span>
              {item.description && (
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
