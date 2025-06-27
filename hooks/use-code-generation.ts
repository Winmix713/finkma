"use client";

import { useState, useCallback, useRef } from "react";
import type {
  FigmaApiResponse,
  GeneratedComponent,
  AppError,
  Toast,
} from "@/types/figma";
import {
  AdvancedCodeGenerator,
  type CodeGenerationOptions,
  type CustomCodeInputs,
} from "@/services/advanced-code-generator";
import {
  copyToClipboard,
  downloadFile,
  validateJSX,
  validateCSS,
  generateId,
} from "@/lib/utils";

export function useCodeGeneration(figmaData: FigmaApiResponse) {
  const [options, setOptions] = useState<CodeGenerationOptions>({
    framework: "react",
    styling: "tailwind",
    typescript: true,
    accessibility: true,
    responsive: true,
    optimizeImages: true,
  });

  const [customCode, setCustomCode] = useState<CustomCodeInputs>({
    jsx: "",
    css: "",
    cssAdvanced: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedComponents, setGeneratedComponents] = useState<
    GeneratedComponent[]
  >([]);
  const [selectedComponent, setSelectedComponent] =
    useState<GeneratedComponent | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const newToast: Toast = {
      ...toast,
      id: generateId(),
      duration: toast.duration || 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, newToast.duration);
  }, []);

  const showSuccessToast = useCallback(
    (message: string) => {
      showToast({ type: "success", message });
    },
    [showToast],
  );

  const showErrorToast = useCallback(
    (message: string) => {
      showToast({ type: "error", message });
    },
    [showToast],
  );

  const showWarningToast = useCallback(
    (message: string) => {
      showToast({ type: "warning", message });
    },
    [showToast],
  );

  const validateInputs = useCallback(() => {
    if (!figmaData) {
      throw new Error("Figma data is required");
    }

    if (!figmaData.document) {
      throw new Error("Figma document is missing");
    }

    // Validate custom JSX
    if (customCode.jsx) {
      const jsxValidation = validateJSX(customCode.jsx);
      if (!jsxValidation.isValid) {
        throw new Error(`Invalid JSX: ${jsxValidation.errors[0]?.message}`);
      }

      if (jsxValidation.warnings.length > 0) {
        jsxValidation.warnings.forEach((warning) => {
          showWarningToast(warning.message);
        });
      }
    }

    // Validate custom CSS
    if (customCode.css || customCode.cssAdvanced) {
      const cssToValidate = customCode.css + customCode.cssAdvanced;
      const cssValidation = validateCSS(cssToValidate);
      if (!cssValidation.isValid) {
        throw new Error(`Invalid CSS: ${cssValidation.errors[0]?.message}`);
      }

      if (cssValidation.warnings.length > 0) {
        cssValidation.warnings.forEach((warning) => {
          showWarningToast(warning.message);
        });
      }
    }
  }, [figmaData, customCode, showWarningToast]);

  const handleGenerate = useCallback(async () => {
    // Cancel any ongoing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsGenerating(true);
    setError(null);

    try {
      // Input validation
      validateInputs();

      const generator = new AdvancedCodeGenerator(figmaData, options);
      generator.setCustomCode(customCode);

      // Simulate async operation for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if operation was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      const components = generator.generateComponents();

      if (components.length === 0) {
        throw new Error(
          "No components could be generated from the provided Figma data",
        );
      }

      setGeneratedComponents(components);
      setSelectedComponent(components[0]);
      showSuccessToast(
        `${components.length} component${components.length > 1 ? "s" : ""} generated successfully!`,
      );

      // Analytics tracking (mock)
      console.log("Code generation success:", {
        componentCount: components.length,
        framework: options.framework,
        styling: options.styling,
        hasCustomCode: !!(
          customCode.jsx ||
          customCode.css ||
          customCode.cssAdvanced
        ),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return; // Operation was cancelled
      }

      const appError: AppError = {
        type: "generation",
        message:
          error instanceof Error
            ? error.message
            : "Unknown error occurred during code generation",
        details: error instanceof Error ? error.stack : undefined,
        recoverable: true,
        timestamp: new Date(),
        stackTrace: error instanceof Error ? error.stack : undefined,
      };

      setError(appError);
      showErrorToast(appError.message);

      // Error reporting (mock)
      console.error("Code generation error:", appError);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [
    figmaData,
    options,
    customCode,
    validateInputs,
    showSuccessToast,
    showErrorToast,
  ]);

  const handleCopy = useCallback(
    async (content: string, type: string) => {
      try {
        await copyToClipboard(content);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
        showSuccessToast("Copied to clipboard!");

        // Analytics tracking (mock)
        console.log("Code copied:", { type, contentLength: content.length });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to copy to clipboard";
        showErrorToast(message);
      }
    },
    [showSuccessToast, showErrorToast],
  );

  const handleDownload = useCallback(
    (content: string, filename: string) => {
      try {
        downloadFile(content, filename);
        showSuccessToast(`File ${filename} downloaded successfully`);

        // Analytics tracking (mock)
        console.log("File downloaded:", { filename, size: content.length });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to download file";
        showErrorToast(message);
      }
    },
    [showSuccessToast, showErrorToast],
  );

  const getFileExtension = useCallback(
    (type: string) => {
      switch (type) {
        case "jsx":
          return options.typescript ? ".tsx" : ".jsx";
        case "css":
          return ".css";
        case "typescript":
          return ".d.ts";
        default:
          return ".txt";
      }
    },
    [options.typescript],
  );

  const handleDownloadAll = useCallback(() => {
    if (!selectedComponent) return;

    try {
      const files = [
        {
          name: `${selectedComponent.name}${getFileExtension("jsx")}`,
          content: selectedComponent.jsx,
        },
        {
          name: `${selectedComponent.name}.css`,
          content: selectedComponent.css,
        },
      ];

      if (selectedComponent.typescript) {
        files.push({
          name: `${selectedComponent.name}.d.ts`,
          content: selectedComponent.typescript,
        });
      }

      files.forEach((file) => {
        downloadFile(file.content, file.name);
      });

      showSuccessToast(`${files.length} files downloaded successfully`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to download files";
      showErrorToast(message);
    }
  }, [selectedComponent, getFileExtension, showSuccessToast, showErrorToast]);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      showWarningToast("Code generation cancelled");
    }
  }, [showWarningToast]);

  return {
    // State
    options,
    setOptions,
    customCode,
    setCustomCode,
    isGenerating,
    generatedComponents,
    selectedComponent,
    setSelectedComponent,
    copied,
    error,
    toasts,

    // Actions
    handleGenerate,
    handleCopy,
    handleDownload,
    handleDownloadAll,
    cancelGeneration,
    dismissError,
    removeToast,

    // Toast helpers
    showSuccessToast,
    showErrorToast,
    showWarningToast,
  };
}
