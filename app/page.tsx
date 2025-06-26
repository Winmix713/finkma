"use client";

import { useState } from "react";
import { FigmaGenerator } from "@/components/figma-generator";
import { FigmaInfoDisplay } from "@/components/figma-info-display";
import { CodePreview } from "@/code-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Figma, Code, BarChart3, Zap, AlertTriangle } from "lucide-react";
import { ToastProvider } from "@/components/ui/toast-system";
import { FigmaErrorBoundary } from "@/components/error-boundary";
import type { FigmaApiResponse } from "@/types/figma-api";

export default function Home() {
  const [figmaData, setFigmaData] = useState<FigmaApiResponse | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFigmaDataLoad = (data: FigmaApiResponse) => {
    try {
      setFigmaData(data);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load Figma data";
      setError(errorMessage);
      console.error("Error loading Figma data:", err);
    }
  };

  const handleCodeGeneration = (code: string) => {
    try {
      if (typeof code !== "string") {
        throw new Error("Generated code must be a string");
      }
      setGeneratedCode(code);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate code";
      setError(errorMessage);
      console.error("Error generating code:", err);
    }
  };

  const handleError = (errorMessage: string | Error) => {
    try {
      const message =
        errorMessage instanceof Error ? errorMessage.message : errorMessage;
      setError(message);
      setFigmaData(null);
    } catch (err) {
      console.error("Error handling error:", err);
      setError("An unexpected error occurred");
    }
  };

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handleRefresh = () => {
    try {
      setError(null);
      setIsLoading(true);
      // Trigger refresh logic here
      console.log("Refreshing analysis...");
      setTimeout(() => setIsLoading(false), 1000);
    } catch (err) {
      console.error("Error during refresh:", err);
      setError("Failed to refresh data");
      setIsLoading(false);
    }
  };

  return (
    <ToastProvider>
      <FigmaErrorBoundary showDetails={process.env.NODE_ENV === "development"}>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto py-8 px-4 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <Figma className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Figma to Code Generator
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transform your Figma designs into production-ready code with
                advanced analysis, quality metrics, and accessibility insights.
              </p>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Enterprise Ready
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  Quality Analysis
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  Multi-Framework
                </Badge>
              </div>
            </div>

            {/* Global Error Display */}
            {error && (
              <div className="max-w-2xl mx-auto">
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-5 w-5" />
                      Error
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-700">{error}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Content */}
            <Tabs defaultValue="generator" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="generator"
                  className="flex items-center gap-2"
                >
                  <Figma className="h-4 w-4" />
                  Figma Import
                </TabsTrigger>
                <TabsTrigger
                  value="analysis"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analysis & Insights
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Generated Code
                </TabsTrigger>
              </TabsList>

              {/* Figma Import Tab */}
              <TabsContent value="generator">
                <FigmaErrorBoundary>
                  <FigmaGenerator
                    enableAdvancedFeatures={true}
                    enableCollaboration={false}
                    enableSecurity={true}
                    onDataLoad={handleFigmaDataLoad}
                    onCodeGeneration={handleCodeGeneration}
                    onError={handleError}
                    onLoadingChange={handleLoadingChange}
                    onFileProcessed={(data) => {
                      console.log(
                        "File processed:",
                        data?.name || "Unknown file",
                      );
                    }}
                    onExportCompleted={(format, data) => {
                      console.log("Export completed:", format);
                    }}
                  />
                </FigmaErrorBoundary>
              </TabsContent>

              {/* Analysis Tab */}
              <TabsContent value="analysis">
                <FigmaErrorBoundary>
                  <FigmaInfoDisplay
                    figmaData={figmaData}
                    isLoading={isLoading}
                    error={error}
                    onRefresh={handleRefresh}
                  />
                </FigmaErrorBoundary>
              </TabsContent>

              {/* Code Tab */}
              <TabsContent value="code">
                <FigmaErrorBoundary>
                  {generatedCode ? (
                    <CodePreview
                      code={generatedCode}
                      language="typescript"
                      framework="react"
                      onCodeChange={setGeneratedCode}
                    />
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          Generated Code
                        </CardTitle>
                        <CardDescription>
                          Your generated code will appear here after processing
                          a Figma file
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center space-y-4">
                          <Code className="h-12 w-12 mx-auto text-muted-foreground" />
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              No code generated yet
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Import a Figma file to start generating code
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </FigmaErrorBoundary>
              </TabsContent>
            </Tabs>

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Figma className="h-5 w-5" />
                    Smart Import
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-600">
                    Advanced Figma API integration with intelligent component
                    detection and design system analysis.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <BarChart3 className="h-5 w-5" />
                    Quality Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-purple-600">
                    Comprehensive quality analysis including accessibility
                    audits, performance metrics, and best practices.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Code className="h-5 w-5" />
                    Production Ready
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">
                    Generate clean, maintainable code for React, Vue, Angular,
                    and more with TypeScript support.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </FigmaErrorBoundary>
    </ToastProvider>
  );
}
