/**
 * Enhanced Figma API client with comprehensive features and demo mode
 */

import type {
  FigmaApiResponse,
  FigmaApiError,
  FigmaRateLimit,
  FigmaApiMetadata,
  FigmaUser,
  ApiKeyValidationResult,
} from "@/types/figma-api";

export interface FigmaApiClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableCaching?: boolean;
  cacheTimeout?: number;
  enableRateLimiting?: boolean;
  maxRequestsPerMinute?: number;
  enableCompression?: boolean;
  userAgent?: string;
}

export interface RequestOptions {
  signal?: AbortSignal;
  priority?: "low" | "normal" | "high";
  useCache?: boolean;
  bypassRateLimit?: boolean;
  metadata?: Record<string, any>;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  etag?: string;
  metadata: FigmaApiMetadata;
}

export interface RateLimitState {
  remaining: number;
  reset: number;
  limit: number;
  queue: QueuedRequest[];
}

interface QueuedRequest {
  id: string;
  url: string;
  options: RequestInit;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  priority: "low" | "normal" | "high";
  timestamp: number;
}

export class FigmaApiClient {
  private options: Required<FigmaApiClientOptions>;
  private cache = new Map<string, CacheEntry<any>>();
  private rateLimitState: RateLimitState = {
    remaining: 1000,
    reset: Date.now() + 60000,
    limit: 1000,
    queue: [],
  };
  private requestQueue: QueuedRequest[] = [];
  private isProcessingQueue = false;
  private abortController = new AbortController();
  private isDemoMode = false;

  constructor(apiKey: string) {
    // Check if this is a demo/invalid key
    this.isDemoMode =
      !apiKey || apiKey === "demo" || !this.isValidApiKeyFormat(apiKey);

    this.options = {
      apiKey: this.isDemoMode ? "demo" : apiKey,
      baseUrl: "https://api.figma.com/v1",
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCaching: true,
      cacheTimeout: 3600000, // 1 hour
      enableRateLimiting: true,
      maxRequestsPerMinute: 60,
      enableCompression: true,
      userAgent: "FigmaGenerator/1.0.0",
    };

    // Start queue processor
    this.processQueue();

    // Cleanup cache periodically
    setInterval(() => this.cleanupCache(), 60000); // Every minute
  }

  private isValidApiKeyFormat(apiKey: string): boolean {
    return /^figd_[a-zA-Z0-9_-]+$/.test(apiKey);
  }

  private generateDemoData(): FigmaApiResponse {
    return {
      document: {
        id: "0:0",
        name: "Demo Design File",
        type: "DOCUMENT",
        children: [
          {
            id: "1:1",
            name: "Page 1",
            type: "CANVAS",
            children: [
              {
                id: "2:1",
                name: "Header Component",
                type: "COMPONENT",
                children: [
                  {
                    id: "3:1",
                    name: "Logo",
                    type: "IMAGE",
                    absoluteBoundingBox: { x: 0, y: 0, width: 120, height: 40 },
                  },
                  {
                    id: "3:2",
                    name: "Navigation",
                    type: "FRAME",
                    children: [
                      {
                        id: "4:1",
                        name: "Home",
                        type: "TEXT",
                        characters: "Home",
                        style: { fontSize: 16, fontFamily: "Inter" },
                      },
                      {
                        id: "4:2",
                        name: "About",
                        type: "TEXT",
                        characters: "About",
                        style: { fontSize: 16, fontFamily: "Inter" },
                      },
                    ],
                  },
                ],
              },
              {
                id: "2:2",
                name: "Hero Section",
                type: "FRAME",
                children: [
                  {
                    id: "5:1",
                    name: "Hero Title",
                    type: "TEXT",
                    characters: "Welcome to Our Platform",
                    style: {
                      fontSize: 48,
                      fontFamily: "Inter",
                      fontWeight: 700,
                    },
                  },
                  {
                    id: "5:2",
                    name: "Hero Subtitle",
                    type: "TEXT",
                    characters: "Build amazing products with our design system",
                    style: { fontSize: 18, fontFamily: "Inter" },
                  },
                  {
                    id: "5:3",
                    name: "CTA Button",
                    type: "COMPONENT",
                    children: [
                      {
                        id: "6:1",
                        name: "Button Text",
                        type: "TEXT",
                        characters: "Get Started",
                        style: {
                          fontSize: 16,
                          fontFamily: "Inter",
                          fontWeight: 600,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      components: {
        "2:1": {
          name: "Header Component",
          type: "COMPONENT",
          description: "Main navigation header",
        },
        "5:3": {
          name: "CTA Button",
          type: "COMPONENT",
          description: "Primary call-to-action button",
        },
      },
      componentSets: {},
      schemaVersion: 1,
      styles: {
        "S:1": {
          name: "Primary Color",
          styleType: "FILL",
          type: "SOLID",
          color: { r: 0.2, g: 0.4, b: 1.0 },
        },
        "S:2": {
          name: "Heading Large",
          styleType: "TEXT",
          fontSize: 48,
          fontFamily: "Inter",
          fontWeight: 700,
        },
      },
      name: "Demo Design File",
      lastModified: new Date().toISOString(),
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      version: "1.0.0",
      role: "owner",
      editorType: "figma",
      linkAccess: "view",
    };
  }

  /**
   * Get file information
   */
  async getFile(
    fileKey: string,
    options: RequestOptions = {},
  ): Promise<FigmaApiResponse> {
    if (this.isDemoMode) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return this.generateDemoData();
    }

    const url = `/files/${fileKey}`;
    return this.request<FigmaApiResponse>(url, {}, options);
  }

  /**
   * Validate API key
   */
  async validateApiKey(): Promise<ApiKeyValidationResult> {
    if (this.isDemoMode) {
      return {
        isValid: true,
        user: {
          id: "demo",
          email: "demo@example.com",
          handle: "Demo User",
          img_url: "/placeholder.svg?height=40&width=40",
        },
      };
    }

    try {
      const user = await this.request<FigmaUser>("/me");
      return { isValid: true, user };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Invalid API key",
      };
    }
  }

  /**
   * Get user information
   */
  async getUser(): Promise<FigmaUser> {
    if (this.isDemoMode) {
      return {
        id: "demo",
        email: "demo@example.com",
        handle: "Demo User",
        img_url: "/placeholder.svg?height=40&width=40",
      };
    }

    const cached = this.getFromCache<FigmaUser>("user");
    if (cached) {
      return cached.data;
    }

    const user = await this.request<FigmaUser>("/me");
    this.setCache("user", user, {
      requestId: "user",
      timestamp: Date.now(),
      rateLimit: this.rateLimitState,
      cacheHit: false,
      responseTime: 0,
    });
    return user;
  }

  /**
   * Generic request method with comprehensive error handling
   */
  private async request<T>(
    endpoint: string,
    requestOptions: RequestInit = {},
    options: RequestOptions = {},
  ): Promise<T> {
    if (this.isDemoMode) {
      throw new Error("Demo mode - API requests not available");
    }

    const url = `${this.options.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(url, requestOptions);

    // Check cache first
    if (options.useCache !== false && this.options.enableCaching) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return cached.data;
      }
    }

    // Check rate limiting
    if (this.options.enableRateLimiting && !options.bypassRateLimit) {
      if (
        this.rateLimitState.remaining <= 0 &&
        Date.now() < this.rateLimitState.reset
      ) {
        // Queue the request
        return this.queueRequest<T>(url, requestOptions, options);
      }
    }

    const startTime = Date.now();
    let attempt = 0;
    let lastError: Error;

    while (attempt <= this.options.retryAttempts) {
      try {
        const response = await this.makeRequest(
          url,
          requestOptions,
          options.signal,
        );
        const data = await this.handleResponse<T>(response);

        // Update rate limit info
        this.updateRateLimitFromResponse(response);

        // Cache successful response
        if (this.options.enableCaching && response.ok) {
          this.setCache(cacheKey, data, {
            requestId: response.headers.get("x-request-id") || "",
            timestamp: startTime,
            rateLimit: this.rateLimitState,
            cacheHit: false,
            responseTime: Date.now() - startTime,
          });
        }

        return data;
      } catch (error) {
        lastError = error as Error;
        attempt++;

        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          break;
        }

        // Wait before retry
        if (attempt <= this.options.retryAttempts) {
          await this.delay(this.options.retryDelay * Math.pow(2, attempt - 1));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Make HTTP request with proper headers and options
   */
  private async makeRequest(
    url: string,
    options: RequestInit,
    signal?: AbortSignal,
  ): Promise<Response> {
    const headers = new Headers({
      "X-Figma-Token": this.options.apiKey,
      "User-Agent": this.options.userAgent,
      Accept: "application/json",
      ...((options.headers as Record<string, string>) || {}),
    });

    if (this.options.enableCompression) {
      headers.set("Accept-Encoding", "gzip, deflate, br");
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: signal || this.abortController.signal,
    };

    // Add timeout
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(
      () => timeoutController.abort(),
      this.options.timeout,
    );

    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: signal || timeoutController.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Handle API response and extract data
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: FigmaApiError = {
        status: response.status,
        err: errorData.err || response.statusText,
        message: errorData.message,
      };
      throw new Error(`Figma API Error: ${error.err} (${error.status})`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  /**
   * Queue request for rate limiting
   */
  private async queueRequest<T>(
    url: string,
    requestOptions: RequestInit,
    options: RequestOptions,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        options: requestOptions,
        resolve,
        reject,
        priority: options.priority || "normal",
        timestamp: Date.now(),
      };

      this.requestQueue.push(queuedRequest);
      this.sortQueue();
    });
  }

  /**
   * Process request queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      // Check if we can make requests
      if (
        this.rateLimitState.remaining <= 0 &&
        Date.now() < this.rateLimitState.reset
      ) {
        // Wait until rate limit resets
        await this.delay(this.rateLimitState.reset - Date.now());
      }

      const request = this.requestQueue.shift();
      if (!request) break;

      try {
        const result = await this.request(request.url, request.options, {
          bypassRateLimit: true,
        });
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Sort queue by priority and timestamp
   */
  private sortQueue(): void {
    const priorityOrder = { high: 3, normal: 2, low: 1 };

    this.requestQueue.sort((a, b) => {
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Update rate limit state from response headers
   */
  private updateRateLimitFromResponse(response: Response): void {
    const remaining = response.headers.get("x-ratelimit-remaining");
    const reset = response.headers.get("x-ratelimit-reset");
    const limit = response.headers.get("x-ratelimit-limit");

    if (remaining)
      this.rateLimitState.remaining = Number.parseInt(remaining, 10);
    if (reset) this.rateLimitState.reset = Number.parseInt(reset, 10) * 1000; // Convert to milliseconds
    if (limit) this.rateLimitState.limit = Number.parseInt(limit, 10);
  }

  /**
   * Cache management
   */
  private getCacheKey(url: string, options: RequestInit): string {
    const optionsString = JSON.stringify(options);
    return `${url}:${btoa(optionsString)}`;
  }

  private getFromCache<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry as CacheEntry<T>;
  }

  private setCache<T>(key: string, data: T, metadata: FigmaApiMetadata): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.options.cacheTimeout,
      metadata: { ...metadata, cacheHit: false },
    };

    this.cache.set(key, entry);
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Utility methods
   */
  private shouldNotRetry(error: any): boolean {
    // Don't retry on authentication errors, bad requests, etc.
    const nonRetryableStatuses = [400, 401, 403, 404, 422];
    return error.status && nonRetryableStatuses.includes(error.status);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Public utility methods
   */
  getRateLimitStatus(): FigmaRateLimit {
    return { ...this.rateLimitState };
  }

  getCacheStats(): { size: number; hitRate: number; entries: number } {
    const entries = Array.from(this.cache.values());
    const totalRequests = entries.reduce(
      (sum, entry) => sum + (entry.metadata.cacheHit ? 0 : 1),
      0,
    );
    const cacheHits = entries.filter((entry) => entry.metadata.cacheHit).length;

    return {
      size: this.cache.size,
      hitRate: totalRequests > 0 ? cacheHits / totalRequests : 0,
      entries: this.cache.size,
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  abort(): void {
    this.abortController.abort();
    this.abortController = new AbortController();
  }

  destroy(): void {
    this.abort();
    this.clearCache();
    this.requestQueue.length = 0;
  }
}

/**
 * Utility function to extract file key from Figma URL
 */
export function extractFileKeyFromUrl(url: string): string | null {
  const match = url.match(/figma\.com\/(?:file|proto|design)\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Utility function to extract node ID from Figma URL
 */
export function extractNodeIdFromUrl(url: string): string | null {
  const match = url.match(/node-id=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Utility function to validate Figma API key format
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  return /^figd_[a-zA-Z0-9_-]+$/.test(apiKey);
}

/**
 * Create a configured Figma API client instance
 */
export function createFigmaApiClient(apiKey: string): FigmaApiClient {
  return new FigmaApiClient(apiKey);
}
