"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Link, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface FigmaUrlFormProps {
  onSubmit: (url: string) => Promise<void>;
  isProcessing?: boolean;
  disabled?: boolean;
}

export function FigmaUrlForm({
  onSubmit,
  isProcessing = false,
  disabled = false,
}: FigmaUrlFormProps) {
  const [url, setUrl] = useState("");
  const [validation, setValidation] = useState<ReturnType<
    typeof validateFigmaUrl
  > | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value.trim()) {
      const result = validateFigmaUrl(value);
      setValidation(result);
    } else {
      setValidation(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      error("URL Required", "Please enter a Figma URL");
      return;
    }

    const result = validateFigmaUrl(url);
    if (!result.isValid) {
      error("Invalid URL", result.error);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(url);
      success("Processing Started", "Your Figma file is being processed");
      setUrl("");
      setValidation(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process URL";
      error("Processing Failed", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getValidationIcon = () => {
    if (!validation) return null;

    if (validation.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getValidationMessage = () => {
    if (!validation) return null;

    if (validation.isValid) {
      return (
        <p className="text-sm text-green-600 mt-1">
          Valid {validation.urlType} URL detected
        </p>
      );
    } else {
      return <p className="text-sm text-red-600 mt-1">{validation.error}</p>;
    }
  };

  const isFormDisabled = disabled || isProcessing || isSubmitting;
  const canSubmit = url.trim() && validation?.isValid && !isFormDisabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Process Figma File
        </CardTitle>
        <CardDescription>
          Enter a Figma file URL to analyze and generate code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="figma-url">Figma URL</Label>
            <div className="relative">
              <Input
                id="figma-url"
                type="url"
                placeholder="https://www.figma.com/file/..."
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                disabled={isFormDisabled}
                className={`pr-10 ${
                  validation?.isValid
                    ? "border-green-300 focus:border-green-500"
                    : validation?.error
                      ? "border-red-300 focus:border-red-500"
                      : ""
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getValidationIcon()}
              </div>
            </div>
            {getValidationMessage()}
          </div>

          <Button type="submit" disabled={!canSubmit} className="w-full">
            {isSubmitting || isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Link className="h-4 w-4 mr-2" />
                Process File
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          <p className="font-medium mb-1">Supported URL formats:</p>
          <ul className="space-y-1">
            <li>• https://www.figma.com/file/[file-id]/...</li>
            <li>• https://www.figma.com/proto/[file-id]/...</li>
            <li>• https://www.figma.com/design/[file-id]/...</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
