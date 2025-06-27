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
import {
  BarChart3,
  Layers,
  Component,
  Palette,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

interface StatisticsDashboardProps {
  statistics: {
    totalNodes: number;
    totalComponents: number;
    totalStyles: number;
    nodesByType: Record<string, number>;
    componentsByType: Record<string, number>;
    stylesByType: Record<string, number>;
  };
  qualityMetrics: {
    overall: number;
    accessibility: number;
    performance: number;
    maintainability: number;
    issues: Array<{
      id: string;
      type: string;
      severity: "low" | "medium" | "high" | "critical";
      message: string;
      nodeId?: string;
      recommendation?: string;
    }>;
  };
}

export function StatisticsDashboard({
  statistics,
  qualityMetrics,
}: StatisticsDashboardProps) {
  const getQualityColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualityIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 70) return <Info className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
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

  const topNodeTypes = Object.entries(statistics.nodesByType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const issuesBySeverity = qualityMetrics.issues.reduce(
    (acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            File Statistics
          </CardTitle>
          <CardDescription>
            Overview of your Figma file structure and composition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <Layers className="h-8 w-8 text-blue-500" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {statistics.totalNodes.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Nodes</p>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <Component className="h-8 w-8 text-purple-500" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {statistics.totalComponents}
                </p>
                <p className="text-sm text-muted-foreground">Components</p>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <Palette className="h-8 w-8 text-orange-500" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{statistics.totalStyles}</p>
                <p className="text-sm text-muted-foreground">Styles</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Node Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Node Type Distribution</CardTitle>
          <CardDescription>
            Breakdown of nodes by type in your design
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topNodeTypes.map(([type, count]) => {
              const percentage = (count / statistics.totalNodes) * 100;
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {type.toLowerCase().replace("_", " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quality Metrics
          </CardTitle>
          <CardDescription>
            Assessment of design quality and best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Quality</span>
                <div className="flex items-center gap-2">
                  {getQualityIcon(qualityMetrics.overall)}
                  <span
                    className={`text-sm font-bold ${getQualityColor(qualityMetrics.overall)}`}
                  >
                    {qualityMetrics.overall}/100
                  </span>
                </div>
              </div>
              <Progress value={qualityMetrics.overall} className="h-2" />
            </div>

            {/* Individual Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Accessibility
                  </span>
                  <span
                    className={`text-xs font-medium ${getQualityColor(qualityMetrics.accessibility)}`}
                  >
                    {qualityMetrics.accessibility}
                  </span>
                </div>
                <Progress
                  value={qualityMetrics.accessibility}
                  className="h-1"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Performance
                  </span>
                  <span
                    className={`text-xs font-medium ${getQualityColor(qualityMetrics.performance)}`}
                  >
                    {qualityMetrics.performance}
                  </span>
                </div>
                <Progress value={qualityMetrics.performance} className="h-1" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Maintainability
                  </span>
                  <span
                    className={`text-xs font-medium ${getQualityColor(qualityMetrics.maintainability)}`}
                  >
                    {qualityMetrics.maintainability}
                  </span>
                </div>
                <Progress
                  value={qualityMetrics.maintainability}
                  className="h-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Summary */}
      {qualityMetrics.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Issues</CardTitle>
            <CardDescription>
              Issues found during quality analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Issues by Severity */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(issuesBySeverity).map(([severity, count]) => (
                  <Badge
                    key={severity}
                    variant={getSeverityColor(severity) as any}
                  >
                    {count} {severity}
                  </Badge>
                ))}
              </div>

              {/* Recent Issues */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recent Issues</h4>
                <div className="space-y-2">
                  {qualityMetrics.issues.slice(0, 3).map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-start gap-2 p-2 rounded-md bg-muted/50"
                    >
                      {getQualityIcon(
                        issue.severity === "critical"
                          ? 0
                          : issue.severity === "high"
                            ? 30
                            : 80,
                      )}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">{issue.message}</p>
                        {issue.recommendation && (
                          <p className="text-xs text-muted-foreground">
                            {issue.recommendation}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={getSeverityColor(issue.severity) as any}
                        className="text-xs"
                      >
                        {issue.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
