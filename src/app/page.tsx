"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Zap,
  Globe,
  Shield,
  Sparkles,
  Palette,
} from "lucide-react";
import { AnimatedTshirt } from "@/components/landingpage/animated-tshirt";
import { FloatingBadges } from "@/components/landingpage/floating-badges";
import { ProductShowcase } from "@/components/landingpage/product-showcase";
import { StatsSection } from "@/components/landingpage/stats-section";
import { ThemeToggle } from "@/components/landingpage/theme-toggle";
import { ProfitCalculator } from "@/components/landingpage/profit-calculator";
import { Testimonials } from "@/components/landingpage/testimonials";
import { ProcessSteps } from "@/components/landingpage/process-steps";
import Link from "next/link";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--scroll-y",
      `${scrollY * 0.5}px`
    );
  }, [scrollY]);

  return (
    <div className="grid-pattern min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="animate-slide-in-left flex items-center space-x-2">
              <div className="glow-on-hover flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Sparkles className="animate-wiggle h-5 w-5 text-white" />
              </div>
              <span className="text-gradient text-xl font-bold">Ethiofy</span>
            </div>

            <div className="hidden items-center space-x-8 md:flex">
              <a
                href="#products"
                className="nav-link text-muted-foreground hover:text-foreground"
              >
                Products
              </a>
              <a
                href="#how-it-works"
                className="nav-link text-muted-foreground hover:text-foreground"
              >
                How it works
              </a>
              <a
                href="#providers"
                className="nav-link text-muted-foreground hover:text-foreground"
              >
                Providers
              </a>
            </div>

            <div className="animate-slide-in-right flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="magnetic-button text-muted-foreground hover:text-foreground"
                >
                  Become a print provider
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pb-20 pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in-up space-y-8">
              <Badge className="magnetic-button border-primary/20 bg-primary/10 text-primary hover:bg-primary/20">
                <Zap className="animate-wiggle mr-1 h-3 w-3" />
                New:Designer tool for your products
              </Badge>

              <div className="space-y-6">
                <h1 className="text-5xl font-bold leading-tight lg:text-7xl">
                  Create and order{" "}
                  <span className="text-shimmer">custom products</span> directly
                </h1>
                <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground">
                  Skip the middleman. Connect directly with premium print
                  providers. Zero inventory, infinite possibilities.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="glow-purple animate-pulse-glow magnetic-button ripple-effect bg-primary px-8 py-6 text-lg hover:bg-primary/90"
                  >
                    Start Designing
                    <Palette className="icon-bounce ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="magnetic-button tilt-hover border-border bg-transparent px-8 py-6 text-lg hover:bg-secondary/50"
                  >
                    Sign in
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="stagger-animation scale-on-hover flex items-center space-x-2">
                  <Shield className="animate-wiggle h-4 w-4 text-green-500" />
                  <span>100% Secure</span>
                </div>
                <div className="stagger-animation scale-on-hover flex items-center space-x-2">
                  <Globe className="animate-wiggle h-4 w-4 text-blue-500" />
                  <span>local Shipping</span>
                </div>
                <div className="stagger-animation scale-on-hover flex items-center space-x-2">
                  <Zap className="animate-wiggle h-4 w-4 text-orange-500" />
                  <span>Instant Quotes</span>
                </div>
              </div>
            </div>

            <div className="animate-slide-in-right relative">
              <div className="parallax-slow">
                <AnimatedTshirt />
                <FloatingBadges />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Product Showcase */}
      <ProductShowcase />

      <ProcessSteps />
      {/* 
      <ProfitCalculator />

      <Testimonials /> */}

      {/* Provider Network */}
      <section className="bg-secondary/30 px-6 py-20">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="mb-8 text-3xl font-bold">
            Trusted by leading print providers
          </h2>
          <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
            {[
              "Printful",
              "Gooten",
              "Printify",
              "Gelato",
              "Teespring",
              "CustomCat",
            ].map((provider, index) => (
              <div
                key={index}
                className="magnetic-button stagger-animation cursor-pointer text-lg font-semibold transition-all duration-300 hover:scale-110 hover:opacity-100"
              >
                {provider}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
            Ready to start your{" "}
            <span className="text-gradient">print empire?</span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            Join thousands of creators who've ditched inventory and embraced the
            future of print-on-demand.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="glow-purple magnetic-button ripple-effect bg-primary px-12 py-6 text-lg hover:bg-primary/90"
              >
                Design Your First Product
                <Palette className="icon-bounce ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="magnetic-button tilt-hover border-border bg-transparent px-12 py-6 text-lg hover:bg-secondary/50"
              >
                Sign in
                <ArrowRight className="icon-bounce ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-gradient text-xl font-bold">Ethiofy</span>
              </div>
              <p className="text-muted-foreground">
                The future of print-on-demand. Direct connections, zero
                inventory.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: [
                  "Design Tools",
                  "Provider Network",
                  "Quality Control",
                  "API Access",
                ],
              },
              {
                title: "Resources",
                links: ["Documentation", "Tutorials", "Community", "Support"],
              },
              {
                title: "Company",
                links: ["About", "Careers", "Press", "Contact"],
              },
            ].map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-semibold">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href="#"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-border pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Ethiofy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
