"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { validateFigmaUrl } from "@/utils/figma-url-validator";
import { useToast } from "@/components/ui/toast-system";
import { Upload, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";

interface BatchImportFormProps {
  onSubmit: (urls: string[]) => Promise<void>;
  isProcessing?: boolean;
  disabled?: boolean;
}

interface UrlValidationResult {
  url: string;
  isValid: boolean;
  error?: string;
  fileId?: string;
}

export function BatchImportForm({
  onSubmit,
  isProcessing = false,
  disabled = false,
}: BatchImportFormProps) {
  const [urlsText, setUrlsText] = useState("");
  const [validatedUrls, setValidatedUrls] = useState<UrlValidationResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error, warning } = useToast();

  const parseAndValidateUrls = (text: string): UrlValidationResult[] => {
    if (!text.trim()) return [];

    // Split by newlines and filter out empty lines
    const urls = text
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    // Remove duplicates
    const uniqueUrls = [...new Set(urls)];

    // Validate each URL
    return uniqueUrls.map((url) => {
      const validation = validateFigmaUrl(url);
      return {
        url,
        isValid: validation.isValid,
        error: validation.error,
        fileId: validation.fileId,
      };
    });
  };

  const handleUrlsChange = (value: string) => {
    setUrlsText(value);
    const validated = parseAndValidateUrls(value);
    setValidatedUrls(validated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!urlsText.trim()) {
      error("URLs Required", "Please enter at least one Figma URL");
      return;
    }

    const validUrls = validatedUrls.filter((item) => item.isValid);
    const invalidUrls = validatedUrls.filter((item) => !item.isValid);

    if (validUrls.length === 0) {
      error("No Valid URLs", "Please provide at least one valid Figma URL");
      return;
    }

    if (invalidUrls.length > 0) {
      warning(
        "Some URLs Invalid",
        `${invalidUrls.length} URL(s) will be skipped due to validation errors`,
      );
    }

    setIsSubmitting(true);
    try {
      await onSubmit(validUrls.map((item) => item.url));
      success(
        "Batch Processing Started",
        `Processing ${validUrls.length} Figma file(s)`,
      );
      setUrlsText("");
      setValidatedUrls([]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process URLs";
      error("Batch Processing Failed", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeUrl = (indexToRemove: number) => {
    const urls = urlsText
      .split("\n")
      .filter((_, index) => index !== indexToRemove);
    const newText = urls.join("\n");
    handleUrlsChange(newText);
  };

  const validCount = validatedUrls.filter((item) => item.isValid).length;
  const invalidCount = validatedUrls.filter((item) => !item.isValid).length;
  const isFormDisabled = disabled || isProcessing || isSubmitting;
  const canSubmit = validCount > 0 && !isFormDisabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Batch Import
        </CardTitle>
        <CardDescription>
          Import multiple Figma files at once (one URL per line)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="batch-urls">Figma URLs</Label>
            <Textarea
              id="batch-urls"
              placeholder={`https://www.figma.com/file/abc123/design-1
https://www.figma.com/file/def456/design-2
https://www.figma.com/proto/ghi789/prototype-1`}
              value={urlsText}
              onChange={(e) => handleUrlsChange(e.target.value)}
              disabled={isFormDisabled}
              rows={6}
              className="resize-none"
            />

            {validatedUrls.length > 0 && (
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-4">
                  {validCount > 0 && (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      {validCount} valid
                    </span>
                  )}
                  {invalidCount > 0 && (
                    <span className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      {invalidCount} invalid
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* URL Validation Results */}
          {validatedUrls.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3 bg-gray-50">
              {validatedUrls.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-xs p-2 rounded ${
                    item.isValid
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  {item.isValid ? (
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="truncate font-mono">{item.url}</p>
                    {item.error && (
                      <p className="text-red-600 mt-1">{item.error}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUrl(index)}
                    className="h-auto p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button type="submit" disabled={!canSubmit} className="w-full">
            {isSubmitting || isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing {validCount} file(s)...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Process {validCount} File(s)
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          <p className="font-medium mb-1">Tips:</p>
          <ul className="space-y-1">
            <li>• Enter one URL per line</li>
            <li>• Duplicate URLs will be automatically removed</li>
            <li>• Invalid URLs will be skipped during processing</li>
            <li>• Maximum recommended: 10 files per batch</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
