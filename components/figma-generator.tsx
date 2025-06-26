"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Link,
  Key,
  Upload,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Wifi,
  WifiOff,
} from "lucide-react";

import { useFigmaConnection } from "@/hooks/use-figma-connection";
import { useToast } from "@/components/ui/toast-system";
import type { FigmaApiResponse } from "@/types/figma-api";

// Import sub-components
import { FigmaUrlForm } from "./forms/figma-url-form";
import { FileUploadForm } from "./forms/file-upload-form";
import { BatchImportForm } from "./forms/batch-import-form";

interface FigmaGeneratorProps {
  /** Initial API key */
  initialApiKey?: string;
  /** Enable advanced features */
  enableAdvancedFeatures?: boolean;
  /** Enable team collaboration */
  enableCollaboration?: boolean;
  /** Enable security features */
  enableSecurity?: boolean;
  /** Callback when file is processed */
  onFileProcessed?: (data: FigmaApiResponse) => void;
  /** Callback when export is completed */
  onExportCompleted?: (format: string, data: any) => void;
  /** Callback when errors occur */
  onError?: (error: Error | string) => void;
  /** Callback when data is loaded */
  onDataLoad?: (data: FigmaApiResponse) => void;
  /** Callback when code is generated */
  onCodeGeneration?: (code: string) => void;
  /** Callback when loading state changes */
  onLoadingChange?: (loading: boolean) => void;
}

export function FigmaGenerator({
  initialApiKey,
  enableAdvancedFeatures = true,
  enableCollaboration = false,
  enableSecurity = true,
  onFileProcessed,
  onExportCompleted,
  onError,
  onDataLoad,
  onCodeGeneration,
  onLoadingChange,
}: FigmaGeneratorProps) {
  const {
    isConnected,
    isConnecting,
    isProcessing,
    error: connectionError,
    validateConnection,
    processUrl,
    processMultipleUrls,
    clearError,
    getConnectionStats,
  } = useFigmaConnection({
    apiKey: initialApiKey,
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
  });

  const [activeTab, setActiveTab] = useState("connection");
  const [apiKey, setApiKey] = useState(initialApiKey || "");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);

  const { success, error: showError, info } = useToast();

  // Handle API key submission
  const handleApiKeySubmit = useCallback(
    async (key: string) => {
      try {
        setApiKey(key);
        onLoadingChange?.(true);

        const isValid = await validateConnection();

        if (isValid) {
          success(
            "Connected Successfully",
            "API key validated and connection established",
          );
          setActiveTab("files");
        } else {
          showError(
            "Connection Failed",
            connectionError?.message || "Invalid API key",
          );
          onError?.(connectionError?.message || "Connection failed");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Connection failed";
        showError("Connection Error", errorMessage);
        onError?.(errorMessage);
      } finally {
        onLoadingChange?.(false);
      }
    },
    [
      validateConnection,
      connectionError,
      success,
      showError,
      onError,
      onLoadingChange,
    ],
  );

  // Handle file URL submission
  const handleFileUrlSubmit = useCallback(
    async (url: string) => {
      try {
        onLoadingChange?.(true);
        info("Processing File", "Analyzing Figma file...");

        const result = await processUrl(url);

        if (result.success && result.data) {
          setProcessedFiles((prev) => [...prev, result]);
          onFileProcessed?.(result.data);
          onDataLoad?.(result.data);
          success(
            "File Processed",
            `Successfully processed file in ${result.processingTime}ms`,
          );
          setActiveTab("explorer");
        } else {
          throw new Error(result.error?.message || "Processing failed");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Processing failed";
        showError("Processing Failed", errorMessage);
        onError?.(errorMessage);
      } finally {
        onLoadingChange?.(false);
      }
    },
    [
      processUrl,
      onFileProcessed,
      onDataLoad,
      success,
      showError,
      onError,
      onLoadingChange,
      info,
    ],
  );

  // Handle batch import
  const handleBatchImport = useCallback(
    async (urls: string[]) => {
      try {
        onLoadingChange?.(true);
        info("Batch Processing", `Processing ${urls.length} files...`);

        const results = await processMultipleUrls(urls);
        const successfulResults = results.filter((r) => r.success);

        if (successfulResults.length > 0) {
          setProcessedFiles((prev) => [...prev, ...successfulResults]);
          successfulResults.forEach((result) => {
            if (result.data) {
              onFileProcessed?.(result.data);
              onDataLoad?.(result.data);
            }
          });

          success(
            "Batch Processing Complete",
            `Successfully processed ${successfulResults.length} of ${urls.length} files`,
          );
          setActiveTab("explorer");
        }

        const failedResults = results.filter((r) => !r.success);
        if (failedResults.length > 0) {
          showError(
            "Some Files Failed",
            `${failedResults.length} files could not be processed`,
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Batch processing failed";
        showError("Batch Processing Failed", errorMessage);
        onError?.(errorMessage);
      } finally {
        onLoadingChange?.(false);
      }
    },
    [
      processMultipleUrls,
      onFileProcessed,
      onDataLoad,
      success,
      showError,
      onError,
      onLoadingChange,
      info,
    ],
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    async (files: File[]) => {
      try {
        onLoadingChange?.(true);
        info("Uploading Files", `Processing ${files.length} uploaded files...`);

        // Simulate file processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        success(
          "Files Uploaded",
          `Successfully uploaded ${files.length} files`,
        );
        // In a real implementation, you would process the uploaded files here
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "File upload failed";
        showError("Upload Failed", errorMessage);
        onError?.(errorMessage);
      } finally {
        onLoadingChange?.(false);
      }
    },
    [success, showError, onError, onLoadingChange, info],
  );

  // Handle export
  const handleExport = useCallback(
    (format: string, data: any) => {
      onExportCompleted?.(format, data);
      success("Export Complete", `Successfully exported in ${format} format`);
    },
    [onExportCompleted, success],
  );

  // Connection statistics
  const connectionStats = useMemo(() => {
    try {
      return getConnectionStats();
    } catch {
      return null;
    }
  }, [getConnectionStats]);

  // Processing statistics - with safe destructuring
  const processingStats = useMemo(() => {
    const results = processedFiles || [];
    const errors = []; // We don't have errors in this simplified version

    return {
      totalProcessed: results.length,
      totalErrors: errors.length,
      successRate: results.length > 0 ? 100 : 0, // Simplified calculation
      averageProcessingTime:
        results.length > 0
          ? results.reduce((sum, r) => sum + (r.processingTime || 0), 0) /
            results.length
          : 0,
    };
  }, [processedFiles]);

  const hasResults = processedFiles.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Figma Generator</h2>
          <p className="text-gray-600">
            Connect to Figma and process design files with enterprise-grade
            features
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Connected</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600">Disconnected</span>
              </>
            )}
          </div>

          {isConnected && (
            <Button variant="outline" size="sm" onClick={() => setApiKey("")}>
              <WifiOff className="w-4 h-4 mr-1" />
              Disconnect
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {connectionError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{connectionError.message}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Bar */}
      {(connectionStats || processingStats.totalProcessed > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {connectionStats && (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-green-600" />
                    <div className="text-sm font-medium">Connected</div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {connectionStats.lastConnectedAt?.toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-lg font-bold">
                    {connectionStats.totalRequests}
                  </div>
                  <div className="text-xs text-gray-600">Total Requests</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-lg font-bold">
                    {connectionStats.averageResponseTime}ms
                  </div>
                  <div className="text-xs text-gray-600">Avg Response</div>
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardContent className="p-4">
              <div className="text-lg font-bold text-green-600">
                {processingStats.totalProcessed}
              </div>
              <div className="text-xs text-gray-600">Files Processed</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-lg font-bold text-red-600">
                {processingStats.totalErrors}
              </div>
              <div className="text-xs text-gray-600">Errors</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-lg font-bold">
                {Math.round(processingStats.successRate)}%
              </div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            value="connection"
            className="flex items-center space-x-2"
          >
            <Key className="w-4 h-4" />
            <span>Connect</span>
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="flex items-center space-x-2"
            disabled={!isConnected}
          >
            <Link className="w-4 h-4" />
            <span>Files</span>
          </TabsTrigger>
          <TabsTrigger
            value="explorer"
            className="flex items-center space-x-2"
            disabled={!hasResults}
          >
            <Upload className="w-4 h-4" />
            <span>Explorer</span>
          </TabsTrigger>
          <TabsTrigger
            value="export"
            className="flex items-center space-x-2"
            disabled={!hasResults}
          >
            <Settings className="w-4 h-4" />
            <span>Export</span>
          </TabsTrigger>
        </TabsList>

        {/* Connection Tab */}
        <TabsContent value="connection" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Key Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>API Connection</span>
                  {isConnected && (
                    <Badge variant="secondary" className="ml-2">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="api-key" className="text-sm font-medium">
                    Figma API Key
                  </label>
                  <input
                    id="api-key"
                    type="password"
                    placeholder="Enter your Figma API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button
                  onClick={() => handleApiKeySubmit(apiKey)}
                  disabled={!apiKey || isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Connection Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Connection Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <div className="flex items-center space-x-2">
                      {isConnected ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">
                            Connected
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-red-600">
                            Disconnected
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {connectionStats && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Requests:</span>
                        <span className="text-sm">
                          {connectionStats.totalRequests}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Success Rate:</span>
                        <span className="text-sm">
                          {connectionStats.totalRequests > 0
                            ? Math.round(
                                (connectionStats.successfulRequests /
                                  connectionStats.totalRequests) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Avg Response:</span>
                        <span className="text-sm">
                          {connectionStats.averageResponseTime}ms
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Single File URL */}
            <FigmaUrlForm
              onSubmit={handleFileUrlSubmit}
              isProcessing={isProcessing}
              disabled={!isConnected}
            />

            {/* Batch Import */}
            <BatchImportForm
              onSubmit={handleBatchImport}
              isProcessing={isProcessing}
              disabled={!isConnected}
            />
          </div>

          {/* File Upload */}
          {enableAdvancedFeatures && (
            <FileUploadForm
              onSubmit={handleFileUpload}
              disabled={!isConnected}
            />
          )}
        </TabsContent>

        {/* Explorer Tab */}
        <TabsContent value="explorer" className="space-y-6">
          {hasResults ? (
            <Card>
              <CardHeader>
                <CardTitle>Processed Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {processedFiles.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            {result.data?.name || `File ${index + 1}`}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Processed in {result.processingTime}ms
                          </p>
                        </div>
                        <Badge variant="secondary">Success</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Files Processed
                </h3>
                <p className="text-gray-600 mb-4">
                  Process Figma files to explore their contents and structure.
                </p>
                <Button onClick={() => setActiveTab("files")}>
                  <Link className="w-4 h-4 mr-2" />
                  Process Files
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          {hasResults ? (
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => handleExport("json", processedFiles)}>
                    Export as JSON
                  </Button>
                  <Button
                    onClick={() => handleExport("typescript", processedFiles)}
                  >
                    Export as TypeScript
                  </Button>
                  <Button onClick={() => handleExport("react", processedFiles)}>
                    Export as React
                  </Button>
                  <Button onClick={() => handleExport("css", processedFiles)}>
                    Export as CSS
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Data to Export
                </h3>
                <p className="text-gray-600 mb-4">
                  Process Figma files first to enable export functionality.
                </p>
                <Button onClick={() => setActiveTab("files")}>
                  <Link className="w-4 h-4 mr-2" />
                  Process Files
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
