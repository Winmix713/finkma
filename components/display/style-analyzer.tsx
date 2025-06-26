"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Palette,
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface StyleAnalyzerProps {
  styles: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    usage: number;
  }>;
  onStyleSelect?: (styleId: string) => void;
}

export function StyleAnalyzer({ styles, onStyleSelect }: StyleAnalyzerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");

  // Get unique style types
  const styleTypes = useMemo(() => {
    const types = new Set(styles.map((style) => style.type));
    return Array.from(types).sort();
  }, [styles]);

  // Calculate style statistics
  const styleStats = useMemo(() => {
    const totalUsage = styles.reduce((sum, style) => sum + style.usage, 0);
    const averageUsage = totalUsage / styles.length || 0;

    const unusedStyles = styles.filter((style) => style.usage === 0).length;
    const overusedStyles = styles.filter(
      (style) => style.usage > averageUsage * 2,
    ).length;
    const underusedStyles = styles.filter(
      (style) => style.usage > 0 && style.usage < averageUsage * 0.5,
    ).length;

    const typeDistribution = styles.reduce(
      (acc, style) => {
        acc[style.type] = (acc[style.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: styles.length,
      totalUsage,
      averageUsage,
      unusedStyles,
      overusedStyles,
      underusedStyles,
      typeDistribution,
    };
  }, [styles]);

  // Filter styles
  const filteredStyles = useMemo(() => {
    return styles.filter((style) => {
      const matchesSearch =
        !searchQuery ||
        style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        style.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !selectedType || style.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [styles, searchQuery, selectedType]);

  const getUsageColor = (usage: number) => {
    if (usage === 0) return "text-red-600";
    if (usage < styleStats.averageUsage * 0.5) return "text-yellow-600";
    if (usage > styleStats.averageUsage * 2) return "text-blue-600";
    return "text-green-600";
  };

  const getUsageIcon = (usage: number) => {
    if (usage === 0) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (usage < styleStats.averageUsage * 0.5)
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getUsageLabel = (usage: number) => {
    if (usage === 0) return "Unused";
    if (usage < styleStats.averageUsage * 0.5) return "Underused";
    if (usage > styleStats.averageUsage * 2) return "Overused";
    return "Normal";
  };

  return (
    <div className="space-y-6">
      {/* Style Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Style Analysis
          </CardTitle>
          <CardDescription>
            Analysis of style usage patterns and optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-blue-600">
                  {styleStats.total}
                </p>
                <p className="text-sm text-muted-foreground">Total Styles</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-green-600">
                  {styleStats.totalUsage}
                </p>
                <p className="text-sm text-muted-foreground">Total Usage</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-yellow-600">
                  {styleStats.unusedStyles}
                </p>
                <p className="text-sm text-muted-foreground">Unused</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(styleStats.averageUsage)}
                </p>
                <p className="text-sm text-muted-foreground">Avg Usage</p>
              </div>
            </div>

            {/* Type Distribution */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Style Type Distribution</h4>
              <div className="space-y-2">
                {Object.entries(styleStats.typeDistribution).map(
                  ([type, count]) => {
                    const percentage = (count / styleStats.total) * 100;
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm capitalize">{type}</span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Style Browser */}
      <Card>
        <CardHeader>
          <CardTitle>Style Browser</CardTitle>
          <CardDescription>
            Browse and analyze individual styles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedType === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("")}
              >
                All Types
              </Button>
              {styleTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredStyles.length} of {styles.length} styles
          </div>

          {/* Style List */}
          <div className="space-y-2">
            {filteredStyles.map((style) => (
              <div
                key={style.id}
                className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onStyleSelect?.(style.id)}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{style.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {style.type}
                    </Badge>
                  </div>
                  {style.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {style.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1">
                      {getUsageIcon(style.usage)}
                      <span
                        className={`text-sm font-medium ${getUsageColor(style.usage)}`}
                      >
                        {style.usage}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getUsageLabel(style.usage)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredStyles.length === 0 && (
            <div className="text-center py-8 space-y-2">
              <Palette className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                No styles found matching your criteria
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Style Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Style Recommendations
          </CardTitle>
          <CardDescription>
            Suggestions for optimizing your style system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {styleStats.unusedStyles > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 border border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-900">
                    Remove Unused Styles
                  </p>
                  <p className="text-xs text-red-800">
                    {styleStats.unusedStyles} styles are not being used and can
                    be safely removed to reduce clutter.
                  </p>
                </div>
              </div>
            )}

            {styleStats.underusedStyles > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-md bg-yellow-50 border border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-yellow-900">
                    Review Underused Styles
                  </p>
                  <p className="text-xs text-yellow-800">
                    {styleStats.underusedStyles} styles have low usage. Consider
                    consolidating or promoting them.
                  </p>
                </div>
              </div>
            )}

            {styleStats.overusedStyles > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-50 border border-blue-200">
                <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900">
                    Popular Styles
                  </p>
                  <p className="text-xs text-blue-800">
                    {styleStats.overusedStyles} styles are heavily used. Ensure
                    they're well-documented and maintained.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 rounded-md bg-green-50 border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-900">
                  Style System Health
                </p>
                <p className="text-xs text-green-800">
                  Your style system has {styleStats.total} styles with an
                  average usage of {Math.round(styleStats.averageUsage)}{" "}
                  instances each.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
