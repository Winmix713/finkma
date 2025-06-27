"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Zap,
  TrendingUp,
  ChevronDown,
  Lightbulb,
  Target,
  Clock,
  HardDrive,
  Package,
} from "lucide-react";

interface PerformanceMetricsProps {
  performance: {
    score: number;
    metrics: {
      complexity: number;
      renderTime: number;
      memoryUsage: number;
      bundleSize: number;
    };
    optimizations: Array<{
      id: string;
      type: string;
      impact: "low" | "medium" | "high";
      description: string;
      implementation: string;
    }>;
  };
}

export function PerformanceMetrics({ performance }: PerformanceMetricsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "high":
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case "medium":
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  const optimizationsByType = performance.optimizations.reduce(
    (acc, opt) => {
      if (!acc[opt.type]) {
        acc[opt.type] = [];
      }
      acc[opt.type].push(opt);
      return acc;
    },
    {} as Record<string, typeof performance.optimizations>,
  );

  const optimizationsByImpact = performance.optimizations.reduce(
    (acc, opt) => {
      acc[opt.impact] = (acc[opt.impact] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Analysis of performance characteristics and optimization
            opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Zap className="h-8 w-8 text-blue-600" />
                  <span
                    className={`text-4xl font-bold ${getScoreColor(performance.score)}`}
                  >
                    {performance.score}
                  </span>
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <p className="text-lg font-medium">Performance Score</p>
              </div>
              <Progress value={performance.score} className="h-3" />
            </div>

            {/* Individual Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center">
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
                <div className="space-y-1">
                  <p
                    className={`text-xl font-bold ${getScoreColor(performance.metrics.complexity)}`}
                  >
                    {performance.metrics.complexity}
                  </p>
                  <p className="text-sm text-muted-foreground">Complexity</p>
                </div>
                <Progress
                  value={performance.metrics.complexity}
                  className="h-2"
                />
              </div>

              <div className="text-center space-y-3">
                <div className="flex items-center justify-center">
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
                <div className="space-y-1">
                  <p
                    className={`text-xl font-bold ${getScoreColor(performance.metrics.renderTime)}`}
                  >
                    {performance.metrics.renderTime}
                  </p>
                  <p className="text-sm text-muted-foreground">Render Time</p>
                </div>
                <Progress
                  value={performance.metrics.renderTime}
                  className="h-2"
                />
              </div>

              <div className="text-center space-y-3">
                <div className="flex items-center justify-center">
                  <HardDrive className="h-8 w-8 text-orange-500" />
                </div>
                <div className="space-y-1">
                  <p
                    className={`text-xl font-bold ${getScoreColor(performance.metrics.memoryUsage)}`}
                  >
                    {performance.metrics.memoryUsage}
                  </p>
                  <p className="text-sm text-muted-foreground">Memory Usage</p>
                </div>
                <Progress
                  value={performance.metrics.memoryUsage}
                  className="h-2"
                />
              </div>

              <div className="text-center space-y-3">
                <div className="flex items-center justify-center">
                  <Package className="h-8 w-8 text-red-500" />
                </div>
                <div className="space-y-1">
                  <p
                    className={`text-xl font-bold ${getScoreColor(performance.metrics.bundleSize)}`}
                  >
                    {performance.metrics.bundleSize}
                  </p>
                  <p className="text-sm text-muted-foreground">Bundle Size</p>
                </div>
                <Progress
                  value={performance.metrics.bundleSize}
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Opportunities</CardTitle>
          <CardDescription>
            {performance.optimizations.length} optimization opportunities
            identified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Optimizations by Impact */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(optimizationsByImpact).map(([impact, count]) => (
                <Badge key={impact} variant={getImpactColor(impact) as any}>
                  {getImpactIcon(impact)}
                  <span className="ml-1">
                    {count} {impact} impact
                  </span>
                </Badge>
              ))}
            </div>

            {/* Optimizations by Type */}
            <div className="space-y-2">
              {Object.entries(optimizationsByType).map(
                ([type, optimizations]) => (
                  <Collapsible key={type}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-3 h-auto"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">
                            {type.replace("_", " ")}
                          </span>
                          <Badge variant="secondary">
                            {optimizations.length}
                          </Badge>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-2 p-3 pt-0">
                        {optimizations.map((optimization) => (
                          <div
                            key={optimization.id}
                            className="space-y-3 p-4 rounded-md bg-muted/50 border"
                          >
                            <div className="flex items-start gap-3">
                              {getImpactIcon(optimization.impact)}
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium">
                                    {optimization.description}
                                  </p>
                                  <Badge
                                    variant={
                                      getImpactColor(optimization.impact) as any
                                    }
                                    className="text-xs"
                                  >
                                    {optimization.impact} impact
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Implementation Guide */}
                            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md">
                              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 space-y-2">
                                <p className="text-sm font-medium text-blue-900">
                                  Implementation
                                </p>
                                <p className="text-xs text-blue-800">
                                  {optimization.implementation}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ),
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Best Practices</CardTitle>
          <CardDescription>
            General guidelines for optimal performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-md border">
              <Target className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Reduce Component Complexity
                </p>
                <p className="text-xs text-muted-foreground">
                  Break down complex components into smaller, reusable pieces to
                  improve maintainability and performance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-md border">
              <Clock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Optimize Render Performance
                </p>
                <p className="text-xs text-muted-foreground">
                  Use efficient layout techniques and minimize unnecessary
                  re-renders in your implementation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-md border">
              <HardDrive className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Memory Management</p>
                <p className="text-xs text-muted-foreground">
                  Implement proper cleanup and avoid memory leaks in event
                  handlers and subscriptions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-md border">
              <Package className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Bundle Size Optimization</p>
                <p className="text-xs text-muted-foreground">
                  Use code splitting, tree shaking, and lazy loading to reduce
                  initial bundle size.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
