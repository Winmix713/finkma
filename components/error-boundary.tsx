"use client";

import type React from "react";
import { Component, type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Bug } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class FigmaErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substr(2, 9),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Figma Integration Error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });

    this.setState({
      errorInfo,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    });
  };

  handleReportError = () => {
    const errorReport = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log("Error Report:", errorReport);

    // In a real app, you would send this to your error reporting service
    alert(
      "Error report copied to console. Please check the browser console for details.",
    );
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Something went wrong
            </CardTitle>
            <CardDescription className="text-red-600">
              An error occurred while loading this component. Error ID:{" "}
              {this.state.errorId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-red-700">
              <p className="font-medium">Error: {this.state.error?.message}</p>
            </div>

            {this.props.showDetails && this.state.error && (
              <details className="text-xs text-red-600">
                <summary className="cursor-pointer font-medium">
                  Technical Details
                </summary>
                <pre className="mt-2 whitespace-pre-wrap bg-red-100 p-2 rounded">
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo && (
                  <pre className="mt-2 whitespace-pre-wrap bg-red-100 p-2 rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="flex gap-2">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="text-red-700 border-red-300 hover:bg-red-100 bg-transparent"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Try Again
              </Button>

              <Button
                onClick={this.handleReportError}
                variant="outline"
                size="sm"
                className="text-red-700 border-red-300 hover:bg-red-100 bg-transparent"
              >
                <Bug className="h-4 w-4 mr-1" />
                Report Error
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
