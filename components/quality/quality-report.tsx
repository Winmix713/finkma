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
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  TrendingUp,
  Target,
  Lightbulb,
} from "lucide-react";

interface QualityReportProps {
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

export function QualityReport({ qualityMetrics }: QualityReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 70) return <Info className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <Info className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
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

  const issuesByCategory = qualityMetrics.issues.reduce(
    (acc, issue) => {
      if (!acc[issue.type]) {
        acc[issue.type] = [];
      }
      acc[issue.type].push(issue);
      return acc;
    },
    {} as Record<string, typeof qualityMetrics.issues>,
  );

  const issuesBySeverity = qualityMetrics.issues.reduce(
    (acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      {/* Overall Quality Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quality Report
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of your design quality and best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  {getScoreIcon(qualityMetrics.overall)}
                  <span
                    className={`text-4xl font-bold ${getScoreColor(qualityMetrics.overall)}`}
                  >
                    {qualityMetrics.overall}
                  </span>
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <p className="text-lg font-medium">Overall Quality Score</p>
              </div>
              <Progress value={qualityMetrics.overall} className="h-3" />
            </div>

            {/* Individual Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Accessibility</span>
                  <div className="flex items-center gap-1">
                    {getScoreIcon(qualityMetrics.accessibility)}
                    <span
                      className={`text-sm font-bold ${getScoreColor(qualityMetrics.accessibility)}`}
                    >
                      {qualityMetrics.accessibility}
                    </span>
                  </div>
                </div>
                <Progress
                  value={qualityMetrics.accessibility}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  WCAG compliance and inclusive design practices
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Performance</span>
                  <div className="flex items-center gap-1">
                    {getScoreIcon(qualityMetrics.performance)}
                    <span
                      className={`text-sm font-bold ${getScoreColor(qualityMetrics.performance)}`}
                    >
                      {qualityMetrics.performance}
                    </span>
                  </div>
                </div>
                <Progress value={qualityMetrics.performance} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Optimization and rendering efficiency
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Maintainability</span>
                  <div className="flex items-center gap-1">
                    {getScoreIcon(qualityMetrics.maintainability)}
                    <span
                      className={`text-sm font-bold ${getScoreColor(qualityMetrics.maintainability)}`}
                    >
                      {qualityMetrics.maintainability}
                    </span>
                  </div>
                </div>
                <Progress
                  value={qualityMetrics.maintainability}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  Code structure and design system consistency
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Issues Summary
          </CardTitle>
          <CardDescription>
            {qualityMetrics.issues.length} issues found across your design
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
                  {getSeverityIcon(severity)}
                  <span className="ml-1">
                    {count} {severity}
                  </span>
                </Badge>
              ))}
            </div>

            {/* Issues by Category */}
            <div className="space-y-2">
              {Object.entries(issuesByCategory).map(([category, issues]) => (
                <Collapsible key={category}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-3 h-auto"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">
                          {category.replace("_", " ")}
                        </span>
                        <Badge variant="secondary">{issues.length}</Badge>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-2 p-3 pt-0">
                      {issues.map((issue) => (
                        <div
                          key={issue.id}
                          className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
                        >
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">
                              {issue.message}
                            </p>
                            {issue.nodeId && (
                              <p className="text-xs text-muted-foreground">
                                Node: {issue.nodeId}
                              </p>
                            )}
                            {issue.recommendation && (
                              <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 rounded-md">
                                <Lightbulb className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-blue-800">
                                  {issue.recommendation}
                                </p>
                              </div>
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
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommendations
          </CardTitle>
          <CardDescription>
            Actionable suggestions to improve your design quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {qualityMetrics.issues
              .filter((issue) => issue.recommendation)
              .slice(0, 5)
              .map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start gap-3 p-3 rounded-md border"
                >
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{issue.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {issue.recommendation}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {issue.type.replace("_", " ")}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
