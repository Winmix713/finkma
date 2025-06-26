"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  validateFigmaUrl,
  type FigmaUrlValidation,
} from "@/utils/figma-url-validator";

interface FigmaApiError {
  status: number;
  message: string;
  details?: string;
  retryable: boolean;
}

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  isProcessing: boolean;
  error: FigmaApiError | null;
  lastConnectedAt?: Date;
}

interface ProcessingResult {
  success: boolean;
  data?: any;
  error?: FigmaApiError;
  url: string;
  processingTime: number;
}

interface UseFigmaConnectionOptions {
  apiKey?: string;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

interface ConnectionStats {
  isConnected: boolean;
  isConnecting: boolean;
  isProcessing: boolean;
  lastConnectedAt?: Date;
  error: FigmaApiError | null;
  uptime?: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
}

export function useFigmaConnection(options: UseFigmaConnectionOptions = {}) {
  const {
    apiKey,
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 10000,
  } = options;

  const [state, setState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    isProcessing: false,
    error: null,
  });

  // Statisztikák követése
  const [stats, setStats] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: [] as number[],
    connectionStartTime: Date.now(),
  });

  const abortControllerRef = useRef<AbortController>();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const createApiError = (
    status: number,
    message: string,
    details?: string,
  ): FigmaApiError => {
    const retryable = status >= 500 || status === 429 || status === 408;

    let userMessage = message;
    switch (status) {
      case 401:
        userMessage = "Invalid API key. Please check your Figma API token.";
        break;
      case 403:
        userMessage =
          "Access denied. You don't have permission to access this file.";
        break;
      case 404:
        userMessage =
          "Figma file not found. Please check the URL and ensure the file exists.";
        break;
      case 429:
        userMessage =
          "Rate limit exceeded. Please wait a moment before trying again.";
        break;
      case 500:
      case 502:
      case 503:
        userMessage =
          "Figma API is temporarily unavailable. Please try again later.";
        break;
      default:
        userMessage = `API Error (${status}): ${message}`;
    }

    return {
      status,
      message: userMessage,
      details,
      retryable,
    };
  };

  const updateStats = useCallback((success: boolean, responseTime: number) => {
    setStats((prev) => ({
      ...prev,
      totalRequests: prev.totalRequests + 1,
      successfulRequests: success
        ? prev.successfulRequests + 1
        : prev.successfulRequests,
      failedRequests: success ? prev.failedRequests : prev.failedRequests + 1,
      responseTimes: [...prev.responseTimes.slice(-99), responseTime], // Csak az utolsó 100 választ tartjuk meg
    }));
  }, []);

  const makeApiRequest = async (url: string, retryCount = 0): Promise<any> => {
    if (!apiKey) {
      throw createApiError(401, "API key is required");
    }

    const requestStartTime = Date.now();

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(
      () => abortControllerRef.current?.abort(),
      timeout,
    );

    try {
      const response = await fetch(url, {
        headers: {
          "X-Figma-Token": apiKey,
          "Content-Type": "application/json",
        },
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - requestStartTime;

      if (!response.ok) {
        updateStats(false, responseTime);

        const errorText = await response.text().catch(() => "Unknown error");
        let errorDetails: any = {};

        try {
          errorDetails = JSON.parse(errorText);
        } catch {
          errorDetails = { message: errorText };
        }

        const apiError = createApiError(
          response.status,
          errorDetails.message || response.statusText,
          errorDetails.details || errorText,
        );

        // Retry logic for retryable errors
        if (enableRetry && apiError.retryable && retryCount < maxRetries) {
          const delay = retryDelay * Math.pow(2, retryCount); // Exponential backoff

          return new Promise((resolve, reject) => {
            retryTimeoutRef.current = setTimeout(async () => {
              try {
                const result = await makeApiRequest(url, retryCount + 1);
                resolve(result);
              } catch (error) {
                reject(error);
              }
            }, delay);
          });
        }

        throw apiError;
      }

      updateStats(true, responseTime);
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      const responseTime = Date.now() - requestStartTime;
      updateStats(false, responseTime);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw createApiError(408, "Request timeout. Please try again.");
        }

        if (error.message.includes("fetch")) {
          throw createApiError(
            0,
            "Network error. Please check your internet connection.",
          );
        }
      }

      // Re-throw API errors as-is
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }

      // Handle unexpected errors
      throw createApiError(
        500,
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    }
  };

  const validateConnection = useCallback(async (): Promise<boolean> => {
    if (!apiKey) return false;

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      await makeApiRequest("https://api.figma.com/v1/me");
      setState((prev) => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        lastConnectedAt: new Date(),
        error: null,
      }));
      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: error as FigmaApiError,
      }));
      return false;
    }
  }, [apiKey]);

  const processUrl = useCallback(
    async (figmaUrl: string): Promise<ProcessingResult> => {
      const startTime = Date.now();

      // Validate URL first
      const validation: FigmaUrlValidation = validateFigmaUrl(figmaUrl);
      if (!validation.isValid) {
        const error = createApiError(
          400,
          validation.error || "Invalid Figma URL",
        );
        return {
          success: false,
          error,
          url: figmaUrl,
          processingTime: Date.now() - startTime,
        };
      }

      setState((prev) => ({ ...prev, isProcessing: true, error: null }));

      try {
        const apiUrl = `https://api.figma.com/v1/files/${validation.fileId}`;
        const data = await makeApiRequest(apiUrl);

        setState((prev) => ({ ...prev, isProcessing: false }));

        return {
          success: true,
          data,
          url: figmaUrl,
          processingTime: Date.now() - startTime,
        };
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error: error as FigmaApiError,
        }));

        return {
          success: false,
          error: error as FigmaApiError,
          url: figmaUrl,
          processingTime: Date.now() - startTime,
        };
      }
    },
    [apiKey],
  );

  const processMultipleUrls = useCallback(
    async (urls: string[]): Promise<ProcessingResult[]> => {
      setState((prev) => ({ ...prev, isProcessing: true, error: null }));

      const results: ProcessingResult[] = [];

      for (const url of urls) {
        try {
          const result = await processUrl(url);
          results.push(result);

          // Small delay between requests to respect rate limits
          if (urls.indexOf(url) < urls.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (error) {
          results.push({
            success: false,
            error: error as FigmaApiError,
            url,
            processingTime: 0,
          });
        }
      }

      setState((prev) => ({ ...prev, isProcessing: false }));
      return results;
    },
    [processUrl],
  );

  const getConnectionStats = useCallback((): ConnectionStats => {
    const averageResponseTime =
      stats.responseTimes.length > 0
        ? stats.responseTimes.reduce((sum, time) => sum + time, 0) /
          stats.responseTimes.length
        : 0;

    const uptime = state.lastConnectedAt
      ? Date.now() - stats.connectionStartTime
      : undefined;

    return {
      isConnected: state.isConnected,
      isConnecting: state.isConnecting,
      isProcessing: state.isProcessing,
      lastConnectedAt: state.lastConnectedAt,
      error: state.error,
      uptime,
      totalRequests: stats.totalRequests,
      successfulRequests: stats.successfulRequests,
      failedRequests: stats.failedRequests,
      averageResponseTime: Math.round(averageResponseTime),
    };
  }, [state, stats]);

  const cancelRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    setState((prev) => ({ ...prev, isProcessing: false, isConnecting: false }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const resetStats = useCallback(() => {
    setStats({
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      connectionStartTime: Date.now(),
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequests();
    };
  }, [cancelRequests]);

  return {
    // State
    ...state,

    // Actions
    validateConnection,
    processUrl,
    processMultipleUrls,
    cancelRequests,
    clearError,
    getConnectionStats,
    resetStats,

    // Utilities
    isReady: !!apiKey && state.isConnected,
    hasRetryableError: state.error?.retryable || false,
    canRetry: enableRetry && (state.error?.retryable || false),
  };
}
