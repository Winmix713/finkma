"use client";

/**
 * Main Design System Panel component - Enterprise-grade design token management
 */

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Palette,
  Download,
  Search,
  Settings,
  History,
  BarChart3,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import type { FigmaApiResponse } from "@/types/figma";
import type { ExtractionOptions } from "@/services/design-system-extractor";
import { useDesignTokens } from "@/hooks/use-design-tokens";

// Import sub-components (these would be implemented separately)
import { TokenExtractor } from "./extraction/token-extractor";
import { TokenPreviewTabs } from "./preview/token-preview-tabs";
import { ExportConfiguration } from "./export/export-configuration";
import { TokenSearch } from "./search-filter/token-search";
import { TokenStatistics } from "./statistics/token-statistics";
import { VersionHistory } from "./collaboration/version-history";
import { ToastNotifications } from "./ui/toast-notifications";

interface DesignSystemPanelProps {
  /** Figma data to extract tokens from */
  figmaData: FigmaApiResponse;
  /** File key for the Figma file */
  fileKey: string;
  /** Initial extraction options */
  initialExtractionOptions?: Partial<ExtractionOptions>;
  /** Callback when tokens are exported */
  onExport?: (format: string, content: string) => void;
  /** Callback when errors occur */
  onError?: (error: Error) => void;
}

export function DesignSystemPanel({
  figmaData,
  fileKey,
  initialExtractionOptions = {},
  onExport,
  onError,
}: DesignSystemPanelProps) {
  const {
    collection,
    displayTokens,
    filter,
    sort,
    searchResults,
    loading,
    extractionProgress,
    errors,
    history,
    selection,
    extractTokens,
    cancelExtraction,
    updateToken,
    deleteToken,
    deleteSelectedTokens,
    duplicateToken,
    setFilter,
    setSort,
    searchTokens,
    selectToken,
    selectAllTokens,
    clearSelection,
    undo,
    redo,
    validateTokens,
    clearErrors,
    hasSelection,
    selectedCount,
    totalTokens,
    filteredCount,
  } = useDesignTokens({
    enableValidation: true,
    autoSaveInterval: 30000,
    maxHistorySize: 50,
  });

  const [activeTab, setActiveTab] = useState("extraction");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Default extraction options
  const defaultExtractionOptions: ExtractionOptions = {
    categories: ["color", "typography", "spacing", "shadow", "border-radius"],
    includeUsage: true,
    validateTokens: true,
    namingConvention: {
      style: "kebab-case",
      prefix: "ds",
    },
    ...initialExtractionOptions,
  };

  const [extractionOptions, setExtractionOptions] = useState(
    defaultExtractionOptions,
  );

  // Handle token extraction
  const handleExtractTokens = useCallback(async () => {
    try {
      await extractTokens(figmaData, extractionOptions);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [figmaData, extractionOptions, extractTokens, onError]);

  // Handle export
  const handleExport = useCallback(
    (format: string, content: string) => {
      onExport?.(format, content);
    },
    [onExport],
  );

  // Compute statistics
  const statistics = useMemo(() => {
    if (!collection) return null;

    const tokensByCategory = collection.tokens.reduce(
      (acc, token) => {
        acc[token.category] = (acc[token.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const validTokens = collection.tokens.filter(
      (token) => token.validation.isValid,
    ).length;
    const invalidTokens = collection.tokens.filter(
      (token) => !token.validation.isValid,
    ).length;
    const warningTokens = collection.tokens.filter(
      (token) => token.validation.warnings.length > 0,
    ).length;

    return {
      totalTokens: collection.tokens.length,
      tokensByCategory,
      validTokens,
      invalidTokens,
      warningTokens,
      validationRate:
        collection.tokens.length > 0
          ? (validTokens / collection.tokens.length) * 100
          : 0,
    };
  }, [collection]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Design System Panel
          </h2>
          <p className="text-gray-600">
            Extract, manage, and export design tokens from {figmaData.name}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          {history.canUndo && (
            <Button variant="outline" size="sm" onClick={undo}>
              <History className="w-4 h-4 mr-1" />
              Undo
            </Button>
          )}
          {history.canRedo && (
            <Button variant="outline" size="sm" onClick={redo}>
              Redo
            </Button>
          )}
          {hasSelection && (
            <Button variant="outline" size="sm" onClick={deleteSelectedTokens}>
              Delete Selected ({selectedCount})
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearErrors}
              className="mt-2"
            >
              Clear Errors
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Bar */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statistics.totalTokens}</div>
              <div className="text-sm text-gray-600">Total Tokens</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {statistics.validTokens}
              </div>
              <div className="text-sm text-gray-600">Valid</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {statistics.invalidTokens}
              </div>
              <div className="text-sm text-gray-600">Invalid</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {statistics.warningTokens}
              </div>
              <div className="text-sm text-gray-600">Warnings</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {Math.round(statistics.validationRate)}%
              </div>
              <div className="text-sm text-gray-600">Valid Rate</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filteredCount}</div>
              <div className="text-sm text-gray-600">Filtered</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger
            value="extraction"
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Extract</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Preview</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </TabsTrigger>
          <TabsTrigger
            value="statistics"
            className="flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Stats</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        {/* Extraction Tab */}
        <TabsContent value="extraction" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Token Extraction</span>
                {loading.extracting && (
                  <Badge variant="secondary" className="ml-2">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Extracting...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TokenExtractor
                figmaData={figmaData}
                options={extractionOptions}
                onOptionsChange={setExtractionOptions}
                onExtract={handleExtractTokens}
                isExtracting={loading.extracting}
                progress={extractionProgress}
                onCancel={cancelExtraction}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          {collection ? (
            <TokenPreviewTabs
              tokens={displayTokens}
              collection={collection}
              selectedTokens={selection.selectedTokens}
              onSelectToken={selectToken}
              onUpdateToken={updateToken}
              onDeleteToken={deleteToken}
              onDuplicateToken={duplicateToken}
              filter={filter}
              sort={sort}
              onFilterChange={setFilter}
              onSortChange={setSort}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Palette className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Tokens Available
                </h3>
                <p className="text-gray-600 mb-4">
                  Extract design tokens from your Figma file to start previewing
                  them.
                </p>
                <Button onClick={() => setActiveTab("extraction")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Start Extraction
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          {collection ? (
            <ExportConfiguration
              collection={collection}
              selectedTokens={Array.from(selection.selectedTokens)}
              onExport={handleExport}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Download className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Tokens to Export
                </h3>
                <p className="text-gray-600 mb-4">
                  Extract design tokens first to enable export functionality.
                </p>
                <Button onClick={() => setActiveTab("extraction")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Extract Tokens
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          {collection ? (
            <TokenSearch
              collection={collection}
              searchResults={searchResults}
              onSearch={searchTokens}
              filter={filter}
              onFilterChange={setFilter}
              selectedTokens={selection.selectedTokens}
              onSelectToken={selectToken}
              showAdvancedFilters={showAdvancedFilters}
              onToggleAdvancedFilters={() =>
                setShowAdvancedFilters(!showAdvancedFilters)
              }
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Tokens to Search
                </h3>
                <p className="text-gray-600 mb-4">
                  Extract design tokens to enable search and filtering.
                </p>
                <Button onClick={() => setActiveTab("extraction")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Extract Tokens
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          {collection && statistics ? (
            <TokenStatistics
              collection={collection}
              statistics={statistics}
              displayTokens={displayTokens}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Statistics Available
                </h3>
                <p className="text-gray-600 mb-4">
                  Extract design tokens to view detailed statistics and
                  analytics.
                </p>
                <Button onClick={() => setActiveTab("extraction")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Extract Tokens
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <VersionHistory
            history={history}
            onUndo={undo}
            onRedo={redo}
            collection={collection}
          />
        </TabsContent>
      </Tabs>

      {/* Toast Notifications */}
      <ToastNotifications />
    </div>
  );
}
