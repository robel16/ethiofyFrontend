"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown } from "lucide-react";

export function SetupProgress() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800">
              <span className="text-sm text-white">📋</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Set up My new store</h2>
              <p className="text-sm text-gray-600">Complete your store setup</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Minimize steps
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Step 1 - Completed */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="space-y-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                Done
              </Badge>
              <h3 className="font-semibold text-gray-900">
                First product created
              </h3>
              <p className="text-sm text-gray-600">
                Great start! You've created your first product.
              </p>
            </div>
          </div>

          {/* Step 2 - Current */}
          <div className="rounded-lg bg-gradient-to-br from-green-600 to-green-700 p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                <span className="text-2xl">🛍️</span>
              </div>
              <div className="space-y-3">
                <Badge className="border-0 bg-white/20 text-white">
                  Step 2
                </Badge>
                <h3 className="text-xl font-semibold">Choose Providers</h3>
                <p className="text-sm text-green-100">
                  Order your product from all the best providers.
                </p>
                <Button className="bg-green-500 text-white hover:bg-green-400">
                  Choose print providers
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
