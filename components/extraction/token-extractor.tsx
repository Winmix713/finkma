"use client";

/**
 * Token extraction interface component
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Square,
  Settings,
  Palette,
  Type,
  BracketsIcon as Spacing,
  GhostIcon as Shadow,
  CornerDownRight,
  Loader2,
} from "lucide-react";

import type { FigmaApiResponse } from "@/types/figma";
import type {
  ExtractionOptions,
  ExtractionProgress,
} from "@/services/design-system-extractor";
import type { TokenCategory } from "@/types/design-tokens";

interface TokenExtractorProps {
  figmaData: FigmaApiResponse;
  options: ExtractionOptions;
  onOptionsChange: (options: ExtractionOptions) => void;
  onExtract: () => void;
  isExtracting: boolean;
  progress?: ExtractionProgress | null;
  onCancel: () => void;
}

const CATEGORY_ICONS = {
  color: Palette,
  typography: Type,
  spacing: Spacing,
  shadow: Shadow,
  "border-radius": CornerDownRight,
  "border-width": CornerDownRight,
  opacity: Settings,
  "z-index": Settings,
  animation: Settings,
  breakpoint: Settings,
} as const;

const CATEGORY_LABELS = {
  color: "Colors",
  typography: "Typography",
  spacing: "Spacing",
  shadow: "Shadows",
  "border-radius": "Border Radius",
  "border-width": "Border Width",
  opacity: "Opacity",
  "z-index": "Z-Index",
  animation: "Animation",
  breakpoint: "Breakpoints",
} as const;

export function TokenExtractor({
  figmaData,
  options,
  onOptionsChange,
  onExtract,
  isExtracting,
  progress,
  onCancel,
}: TokenExtractorProps) {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const updateOptions = (updates: Partial<ExtractionOptions>) => {
    onOptionsChange({ ...options, ...updates });
  };

  const toggleCategory = (category: TokenCategory) => {
    const newCategories = options.categories.includes(category)
      ? options.categories.filter((c) => c !== category)
      : [...options.categories, category];

    updateOptions({ categories: newCategories });
  };

  const updateNamingConvention = (
    updates: Partial<ExtractionOptions["namingConvention"]>,
  ) => {
    updateOptions({
      namingConvention: { ...options.namingConvention, ...updates },
    });
  };

  return (
    <div className="space-y-6">
      {/* Extraction Progress */}
      {isExtracting && progress && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="font-medium text-blue-900">
                  Extracting Tokens
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={onCancel}>
                <Square className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">{progress.currentItem}</span>
                <span className="text-blue-600">
                  {Math.round(progress.progress)}%
                </span>
              </div>
              <Progress value={progress.progress} className="h-2" />
              <div className="text-xs text-blue-600">
                {progress.processedItems} of {progress.totalItems} items
                processed
                {progress.estimatedTimeRemaining && (
                  <span className="ml-2">
                    • ~{Math.round(progress.estimatedTimeRemaining / 1000)}s
                    remaining
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Source Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Source File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">File Name:</span>
              <span className="text-sm text-gray-600">{figmaData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Last Modified:</span>
              <span className="text-sm text-gray-600">
                {new Date(figmaData.lastModified).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Version:</span>
              <span className="text-sm text-gray-600">{figmaData.version}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Token Categories</CardTitle>
          <p className="text-sm text-gray-600">
            Select which types of design tokens to extract from the Figma file.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
              const Icon = CATEGORY_ICONS[category as TokenCategory];
              const isSelected = options.categories.includes(
                category as TokenCategory,
              );

              return (
                <div
                  key={category}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => toggleCategory(category as TokenCategory)}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleCategory(category as TokenCategory)}
                    />
                    <Icon className="w-4 h-4" />
                    <Label className="cursor-pointer">{label}</Label>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Extraction Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Extraction Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-usage"
              checked={options.includeUsage}
              onCheckedChange={(checked) =>
                updateOptions({ includeUsage: !!checked })
              }
            />
            <Label htmlFor="include-usage">Include usage statistics</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="validate-tokens"
              checked={options.validateTokens}
              onCheckedChange={(checked) =>
                updateOptions({ validateTokens: !!checked })
              }
            />
            <Label htmlFor="validate-tokens">
              Validate tokens during extraction
            </Label>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="w-full"
          >
            {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
          </Button>

          {showAdvancedOptions && (
            <div className="space-y-4 pt-4 border-t">
              {/* Naming Convention */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Naming Convention</Label>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="naming-style" className="text-xs">
                      Style
                    </Label>
                    <Select
                      value={options.namingConvention.style}
                      onValueChange={(value: any) =>
                        updateNamingConvention({ style: value })
                      }
                    >
                      <SelectTrigger id="naming-style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="camelCase">camelCase</SelectItem>
                        <SelectItem value="PascalCase">PascalCase</SelectItem>
                        <SelectItem value="kebab-case">kebab-case</SelectItem>
                        <SelectItem value="snake_case">snake_case</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="naming-prefix" className="text-xs">
                      Prefix
                    </Label>
                    <Input
                      id="naming-prefix"
                      value={options.namingConvention.prefix || ""}
                      onChange={(e) =>
                        updateNamingConvention({ prefix: e.target.value })
                      }
                      placeholder="e.g., ds, ui"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="naming-suffix" className="text-xs">
                    Suffix
                  </Label>
                  <Input
                    id="naming-suffix"
                    value={options.namingConvention.suffix || ""}
                    onChange={(e) =>
                      updateNamingConvention({ suffix: e.target.value })
                    }
                    placeholder="e.g., token, var"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extraction Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Extraction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Selected Categories:</span>
              <div className="flex flex-wrap gap-1">
                {options.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {CATEGORY_LABELS[category]}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Naming Style:</span>
              <span className="text-sm text-gray-600">
                {options.namingConvention.style}
              </span>
            </div>
            {options.namingConvention.prefix && (
              <div className="flex justify-between">
                <span className="text-sm">Prefix:</span>
                <span className="text-sm text-gray-600">
                  {options.namingConvention.prefix}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm">Include Usage:</span>
              <span className="text-sm text-gray-600">
                {options.includeUsage ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Validate Tokens:</span>
              <span className="text-sm text-gray-600">
                {options.validateTokens ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extract Button */}
      <div className="flex justify-center">
        <Button
          onClick={onExtract}
          disabled={isExtracting || options.categories.length === 0}
          size="lg"
          className="w-full max-w-md"
        >
          {isExtracting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Extracting Tokens...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Extract Design Tokens
            </>
          )}
        </Button>
      </div>

      {options.categories.length === 0 && (
        <p className="text-center text-sm text-gray-500">
          Please select at least one token category to extract.
        </p>
      )}
    </div>
  );
}
