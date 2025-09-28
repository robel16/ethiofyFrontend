"use client";

import { useState, useEffect } from "react";
import { fabric } from "fabric";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Zap,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageQualityValidatorProps {
  canvas: fabric.Canvas | null;
  selectedImage: fabric.Image | null;
  onQualityCheck?: (result: QualityCheckResult) => void;
}

interface QualityCheckResult {
  overall: "excellent" | "good" | "fair" | "poor";
  score: number;
  issues: QualityIssue[];
  recommendations: string[];
}

interface QualityIssue {
  type: "resolution" | "size" | "format" | "compression" | "aspect";
  severity: "low" | "medium" | "high";
  message: string;
  suggestion?: string;
}

const PRINT_DPI = 300;
const MIN_PRINT_DPI = 150;
const DESIGN_AREA_INCHES = { width: 4, height: 5.33 }; // Approximate design area in inches

export function ImageQualityValidator({
  canvas,
  selectedImage,
  onQualityCheck,
}: ImageQualityValidatorProps) {
  const [qualityResult, setQualityResult] = useState<QualityCheckResult | null>(
    null
  );
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (selectedImage) {
      checkImageQuality(selectedImage);
    } else {
      setQualityResult(null);
    }
  }, [selectedImage]);

  const checkImageQuality = async (image: fabric.Image) => {
    setIsChecking(true);

    try {
      // Get image dimensions and properties
      const imageWidth = image.width || 0;
      const imageHeight = image.height || 0;
      const scaleX = image.scaleX || 1;
      const scaleY = image.scaleY || 1;

      // Calculate actual display size
      const displayWidth = imageWidth * scaleX;
      const displayHeight = imageHeight * scaleY;

      // Calculate DPI based on design area
      const dpiX = imageWidth / (displayWidth / 96); // 96 is screen DPI
      const dpiY = imageHeight / (displayHeight / 96);
      const effectiveDPI = Math.min(dpiX, dpiY);

      const issues: QualityIssue[] = [];
      let score = 100;

      // Check resolution
      if (effectiveDPI < MIN_PRINT_DPI) {
        issues.push({
          type: "resolution",
          severity: "high",
          message: `Low resolution: ${Math.round(effectiveDPI)} DPI (minimum ${MIN_PRINT_DPI} DPI required)`,
          suggestion: "Use a higher resolution image or reduce the size",
        });
        score -= 40;
      } else if (effectiveDPI < PRINT_DPI) {
        issues.push({
          type: "resolution",
          severity: "medium",
          message: `Moderate resolution: ${Math.round(effectiveDPI)} DPI (recommended ${PRINT_DPI} DPI)`,
          suggestion:
            "Consider using a higher resolution image for best print quality",
        });
        score -= 20;
      }

      // Check image size
      if (imageWidth < 300 || imageHeight < 300) {
        issues.push({
          type: "size",
          severity: "medium",
          message: `Small image dimensions: ${imageWidth}x${imageHeight}px`,
          suggestion: "Use larger images for better print quality",
        });
        score -= 15;
      }

      // Check if image is too large for design area
      const designAreaPx = {
        width: DESIGN_AREA_INCHES.width * 96, // Convert inches to pixels at 96 DPI
        height: DESIGN_AREA_INCHES.height * 96,
      };

      if (
        displayWidth > designAreaPx.width * 1.2 ||
        displayHeight > designAreaPx.height * 1.2
      ) {
        issues.push({
          type: "size",
          severity: "low",
          message: "Image extends beyond recommended design area",
          suggestion: "Resize image to fit within the design area",
        });
        score -= 10;
      }

      // Check aspect ratio distortion
      const originalAspect = imageWidth / imageHeight;
      const scaledAspect = (imageWidth * scaleX) / (imageHeight * scaleY);
      const aspectDistortion =
        Math.abs(originalAspect - scaledAspect) / originalAspect;

      if (aspectDistortion > 0.1) {
        issues.push({
          type: "aspect",
          severity: "medium",
          message: "Image aspect ratio is distorted",
          suggestion: "Maintain original proportions when resizing",
        });
        score -= 15;
      }

      // Simulate format and compression checks
      // In a real implementation, you'd analyze the actual image data
      const imageElement = (image as any)._element;
      if (imageElement && imageElement.src) {
        const isJPEG =
          imageElement.src.includes("jpeg") || imageElement.src.includes("jpg");
        const isPNG = imageElement.src.includes("png");

        if (!isPNG && !isJPEG) {
          issues.push({
            type: "format",
            severity: "low",
            message: "Unusual image format detected",
            suggestion:
              "Use PNG for graphics with transparency or JPEG for photos",
          });
          score -= 5;
        }
      }

      // Determine overall quality
      let overall: QualityCheckResult["overall"];
      if (score >= 90) overall = "excellent";
      else if (score >= 75) overall = "good";
      else if (score >= 60) overall = "fair";
      else overall = "poor";

      // Generate recommendations
      const recommendations = generateRecommendations(
        issues,
        effectiveDPI,
        imageWidth,
        imageHeight
      );

      const result: QualityCheckResult = {
        overall,
        score: Math.max(0, score),
        issues,
        recommendations,
      };

      setQualityResult(result);
      onQualityCheck?.(result);
    } catch (error) {
      console.error("Error checking image quality:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const generateRecommendations = (
    issues: QualityIssue[],
    dpi: number,
    width: number,
    height: number
  ): string[] => {
    const recommendations: string[] = [];

    if (dpi < PRINT_DPI) {
      const targetWidth = Math.ceil(DESIGN_AREA_INCHES.width * PRINT_DPI);
      const targetHeight = Math.ceil(DESIGN_AREA_INCHES.height * PRINT_DPI);
      recommendations.push(
        `For optimal print quality, use images at least ${targetWidth}x${targetHeight}px`
      );
    }

    if (issues.some((issue) => issue.type === "aspect")) {
      recommendations.push(
        "Hold Shift while resizing to maintain aspect ratio"
      );
    }

    if (
      issues.some(
        (issue) =>
          issue.type === "size" && issue.message.includes("extends beyond")
      )
    ) {
      recommendations.push(
        "Resize image to fit within the blue design area outline"
      );
    }

    if (issues.length === 0) {
      recommendations.push("Image quality is excellent for printing!");
    }

    return recommendations;
  };

  const getQualityColor = (overall: QualityCheckResult["overall"]) => {
    switch (overall) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "fair":
        return "text-yellow-600";
      case "poor":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getQualityIcon = (overall: QualityCheckResult["overall"]) => {
    switch (overall) {
      case "excellent":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "good":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case "fair":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "poor":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  if (!selectedImage) {
    return (
      <div className="p-4 text-center">
        <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="text-gray-500">Select an image to check print quality</p>
      </div>
    );
  }

  if (isChecking) {
    return (
      <div className="p-4">
        <div className="mb-4 flex items-center space-x-2">
          <Zap className="h-5 w-5 animate-pulse text-blue-600" />
          <span className="text-sm font-medium">
            Analyzing image quality...
          </span>
        </div>
        <Progress value={75} className="h-2" />
      </div>
    );
  }

  if (!qualityResult) {
    return null;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Print Quality Check
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? (
            <X className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Quality Score */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getQualityIcon(qualityResult.overall)}
            <span
              className={cn(
                "font-semibold capitalize",
                getQualityColor(qualityResult.overall)
              )}
            >
              {qualityResult.overall}
            </span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {qualityResult.score}/100
          </span>
        </div>
        <Progress value={qualityResult.score} className="h-2" />
      </div>

      {/* Issues */}
      {qualityResult.issues.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Issues Found</h4>
          {qualityResult.issues.map((issue, index) => (
            <Alert
              key={index}
              variant={issue.severity === "high" ? "destructive" : "default"}
              className={cn(
                issue.severity === "medium" && "border-yellow-200 bg-yellow-50",
                issue.severity === "low" && "border-blue-200 bg-blue-50"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">{issue.message}</div>
                {issue.suggestion && (
                  <div className="mt-1 text-sm opacity-80">
                    {issue.suggestion}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {qualityResult.recommendations.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <h4 className="mb-2 font-medium text-blue-900">Recommendations</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            {qualityResult.recommendations.map((rec, index) => (
              <li key={index}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Info */}
      {showDetails && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="mb-2 font-medium text-gray-900">Technical Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>
              Original: {selectedImage.width}×{selectedImage.height}px
            </div>
            <div>Scale: {Math.round((selectedImage.scaleX || 1) * 100)}%</div>
            <div>
              Display:{" "}
              {Math.round(
                (selectedImage.width || 0) * (selectedImage.scaleX || 1)
              )}
              ×
              {Math.round(
                (selectedImage.height || 0) * (selectedImage.scaleY || 1)
              )}
              px
            </div>
            <div>
              Effective DPI: ~
              {Math.round(
                (selectedImage.width || 0) /
                  (((selectedImage.width || 0) * (selectedImage.scaleX || 1)) /
                    96)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
