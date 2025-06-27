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
  Eye,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ExternalLink,
  Lightbulb,
} from "lucide-react";

interface AccessibilityAuditProps {
  accessibility: {
    score: number;
    issues: Array<{
      id: string;
      type: string;
      severity: "low" | "medium" | "high" | "critical";
      message: string;
      nodeId: string;
      wcagLevel: "A" | "AA" | "AAA";
      recommendation: string;
    }>;
    compliance: {
      wcagA: number;
      wcagAA: number;
      wcagAAA: number;
    };
  };
}

export function AccessibilityAudit({ accessibility }: AccessibilityAuditProps) {
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

  const getWcagLevelColor = (level: string) => {
    switch (level) {
      case "A":
        return "bg-green-100 text-green-800 border-green-200";
      case "AA":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "AAA":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const issuesByType = accessibility.issues.reduce(
    (acc, issue) => {
      if (!acc[issue.type]) {
        acc[issue.type] = [];
      }
      acc[issue.type].push(issue);
      return acc;
    },
    {} as Record<string, typeof accessibility.issues>,
  );

  const issuesBySeverity = accessibility.issues.reduce(
    (acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      {/* Accessibility Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Accessibility Audit
          </CardTitle>
          <CardDescription>
            WCAG compliance analysis and accessibility recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  {getScoreIcon(accessibility.score)}
                  <span
                    className={`text-4xl font-bold ${getScoreColor(accessibility.score)}`}
                  >
                    {accessibility.score}
                  </span>
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <p className="text-lg font-medium">Accessibility Score</p>
              </div>
              <Progress value={accessibility.score} className="h-3" />
            </div>

            {/* WCAG Compliance Levels */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="space-y-1">
                  <Badge className={getWcagLevelColor("A")}>WCAG A</Badge>
                  <p
                    className={`text-2xl font-bold ${getScoreColor(accessibility.compliance.wcagA)}`}
                  >
                    {accessibility.compliance.wcagA}%
                  </p>
                </div>
                <Progress
                  value={accessibility.compliance.wcagA}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  Basic accessibility requirements
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="space-y-1">
                  <Badge className={getWcagLevelColor("AA")}>WCAG AA</Badge>
                  <p
                    className={`text-2xl font-bold ${getScoreColor(accessibility.compliance.wcagAA)}`}
                  >
                    {accessibility.compliance.wcagAA}%
                  </p>
                </div>
                <Progress
                  value={accessibility.compliance.wcagAA}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  Standard compliance level
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="space-y-1">
                  <Badge className={getWcagLevelColor("AAA")}>WCAG AAA</Badge>
                  <p
                    className={`text-2xl font-bold ${getScoreColor(accessibility.compliance.wcagAAA)}`}
                  >
                    {accessibility.compliance.wcagAAA}%
                  </p>
                </div>
                <Progress
                  value={accessibility.compliance.wcagAAA}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  Enhanced accessibility
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Issues</CardTitle>
          <CardDescription>
            {accessibility.issues.length} accessibility issues found
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

            {/* Issues by Type */}
            <div className="space-y-2">
              {Object.entries(issuesByType).map(([type, issues]) => (
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
                          className="space-y-3 p-4 rounded-md bg-muted/50 border"
                        >
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(issue.severity)}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium">
                                  {issue.message}
                                </p>
                                <div className="flex items-center gap-1">
                                  <Badge
                                    variant={
                                      getSeverityColor(issue.severity) as any
                                    }
                                    className="text-xs"
                                  >
                                    {issue.severity}
                                  </Badge>
                                  <Badge
                                    className={`text-xs ${getWcagLevelColor(issue.wcagLevel)}`}
                                  >
                                    {issue.wcagLevel}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Node: {issue.nodeId}
                              </p>
                            </div>
                          </div>

                          {/* Recommendation */}
                          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md">
                            <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <p className="text-sm font-medium text-blue-900">
                                Recommendation
                              </p>
                              <p className="text-xs text-blue-800">
                                {issue.recommendation}
                              </p>
                            </div>
                          </div>
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

      {/* WCAG Guidelines Reference */}
      <Card>
        <CardHeader>
          <CardTitle>WCAG Guidelines Reference</CardTitle>
          <CardDescription>
            Learn more about Web Content Accessibility Guidelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-md border">
              <div className="space-y-1">
                <p className="text-sm font-medium">WCAG 2.1 Guidelines</p>
                <p className="text-xs text-muted-foreground">
                  Complete accessibility guidelines and success criteria
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://www.w3.org/WAI/WCAG21/quickref/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </a>
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-md border">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Accessibility Testing Tools
                </p>
                <p className="text-xs text-muted-foreground">
                  Tools and resources for accessibility testing
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://www.w3.org/WAI/test-evaluate/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </a>
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-md border">
              <div className="space-y-1">
                <p className="text-sm font-medium">Color Contrast Checker</p>
                <p className="text-xs text-muted-foreground">
                  Verify color contrast ratios meet WCAG standards
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://webaim.org/resources/contrastchecker/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Check
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
