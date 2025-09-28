"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Users,
  Calendar,
  BarChart3,
  Activity,
  AlertCircle,
} from "lucide-react";

interface PerformanceData {
  qualityScore: number;
  onTimeDelivery: number;
  customerSatisfaction: number;
  productionEfficiency: number;
  orderCompletionRate: number;
  averageProductionTime: number;
  monthlyRevenue: number;
  totalOrders: number;
  repeatCustomers: number;
  qualityComplaints: number;
}

interface QualityMetric {
  name: string;
  current: number;
  target: number;
  trend: "up" | "down" | "stable";
  description: string;
}

export function PerformanceMetrics() {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    qualityScore: 94.2,
    onTimeDelivery: 97.8,
    customerSatisfaction: 4.7,
    productionEfficiency: 89.3,
    orderCompletionRate: 96.5,
    averageProductionTime: 2.8,
    monthlyRevenue: 18420.75,
    totalOrders: 156,
    repeatCustomers: 78,
    qualityComplaints: 3,
  });

  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([
    {
      name: "Print Quality",
      current: 96.2,
      target: 95.0,
      trend: "up",
      description: "Customer satisfaction with print quality",
    },
    {
      name: "Color Accuracy",
      current: 94.8,
      target: 95.0,
      trend: "down",
      description: "Accuracy of color reproduction",
    },
    {
      name: "Material Quality",
      current: 97.1,
      target: 96.0,
      trend: "up",
      description: "Quality of base materials used",
    },
    {
      name: "Packaging",
      current: 98.5,
      target: 97.0,
      trend: "stable",
      description: "Quality of packaging and presentation",
    },
  ]);

  const getScoreColor = (score: number, threshold: number = 90) => {
    if (score >= threshold) return "text-green-600";
    if (score >= threshold - 10) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number, threshold: number = 90) => {
    if (score >= threshold) return "secondary";
    if (score >= threshold - 10) return "outline";
    return "destructive";
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 95) return { level: "Excellent", color: "text-green-600" };
    if (score >= 90) return { level: "Good", color: "text-blue-600" };
    if (score >= 80) return { level: "Average", color: "text-yellow-600" };
    return { level: "Needs Improvement", color: "text-red-600" };
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Performance Metrics
          </h1>
          <p className="mt-2 text-gray-600">
            Track your provider performance and quality scores
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            Top Performer
          </Badge>
        </div>
      </div>

      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Overall Performance Score
          </CardTitle>
          <CardDescription>
            Your combined performance rating across all metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-blue-600">
                {(
                  (performanceData.qualityScore +
                    performanceData.onTimeDelivery +
                    performanceData.productionEfficiency) /
                  3
                ).toFixed(1)}
                %
              </div>
              <div
                className={`text-lg font-medium ${getPerformanceLevel(performanceData.qualityScore).color}`}
              >
                {getPerformanceLevel(performanceData.qualityScore).level}
              </div>
            </div>
            <div className="text-right">
              <div className="mb-2 text-sm text-gray-600">This Month</div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+2.3%</span>
              </div>
            </div>
          </div>
          <Progress
            value={
              (performanceData.qualityScore +
                performanceData.onTimeDelivery +
                performanceData.productionEfficiency) /
              3
            }
            className="mt-4"
          />
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getScoreColor(performanceData.qualityScore)}`}
            >
              {performanceData.qualityScore}%
            </div>
            <Progress value={performanceData.qualityScore} className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">Target: 95%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              On-Time Delivery
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getScoreColor(performanceData.onTimeDelivery)}`}
            >
              {performanceData.onTimeDelivery}%
            </div>
            <Progress value={performanceData.onTimeDelivery} className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">Target: 95%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Customer Rating
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {performanceData.customerSatisfaction}/5
            </div>
            <div className="mt-2 flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(performanceData.customerSatisfaction) ? "fill-current text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Based on {performanceData.totalOrders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Production Efficiency
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getScoreColor(performanceData.productionEfficiency)}`}
            >
              {performanceData.productionEfficiency}%
            </div>
            <Progress
              value={performanceData.productionEfficiency}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Avg: {performanceData.averageProductionTime} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Metrics Breakdown</CardTitle>
          <CardDescription>
            Detailed breakdown of quality performance across different areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityMetrics.map((metric, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h4 className="font-medium">{metric.name}</h4>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <p className="mb-2 text-sm text-gray-600">
                    {metric.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={metric.current} className="h-2" />
                    </div>
                    <div className="min-w-0 text-sm text-gray-600">
                      {metric.current}% / {metric.target}%
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <Badge
                    variant={getScoreBadgeVariant(
                      metric.current,
                      metric.target
                    )}
                    className={getScoreColor(metric.current, metric.target)}
                  >
                    {metric.current >= metric.target
                      ? "On Target"
                      : "Below Target"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Performance Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
            <CardDescription>
              Key performance indicators for this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Orders</span>
              <span className="font-semibold">
                {performanceData.totalOrders}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="font-semibold text-green-600">
                {performanceData.orderCompletionRate}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Repeat Customers</span>
              <span className="font-semibold">
                {performanceData.repeatCustomers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Quality Complaints</span>
              <span
                className={`font-semibold ${performanceData.qualityComplaints <= 5 ? "text-green-600" : "text-red-600"}`}
              >
                {performanceData.qualityComplaints}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Revenue</span>
              <span className="font-semibold text-blue-600">
                ${performanceData.monthlyRevenue.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Improvement Recommendations</CardTitle>
            <CardDescription>
              Suggestions to enhance your performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {performanceData.qualityScore < 95 && (
              <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div>
                  <h5 className="font-medium text-yellow-800">
                    Improve Quality Score
                  </h5>
                  <p className="text-sm text-yellow-700">
                    Focus on print quality and material consistency to reach the
                    95% target.
                  </p>
                </div>
              </div>
            )}

            {performanceData.onTimeDelivery < 95 && (
              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <Clock className="mt-0.5 h-5 w-5 text-blue-600" />
                <div>
                  <h5 className="font-medium text-blue-800">
                    Optimize Delivery Times
                  </h5>
                  <p className="text-sm text-blue-700">
                    Review production workflow to improve on-time delivery
                    rates.
                  </p>
                </div>
              </div>
            )}

            {performanceData.productionEfficiency < 90 && (
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                <Target className="mt-0.5 h-5 w-5 text-green-600" />
                <div>
                  <h5 className="font-medium text-green-800">
                    Boost Efficiency
                  </h5>
                  <p className="text-sm text-green-700">
                    Streamline production processes to increase overall
                    efficiency.
                  </p>
                </div>
              </div>
            )}

            {performanceData.qualityScore >= 95 &&
              performanceData.onTimeDelivery >= 95 &&
              performanceData.productionEfficiency >= 90 && (
                <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                  <div>
                    <h5 className="font-medium text-green-800">
                      Excellent Performance!
                    </h5>
                    <p className="text-sm text-green-700">
                      You're meeting all performance targets. Keep up the great
                      work!
                    </p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
