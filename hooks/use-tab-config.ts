"use client";

/**
 * Custom hook for tab configuration and management
 */

import { useMemo, useCallback } from "react";
import type { CodeContent, TabConfig } from "@/types/code-preview";
import { TAB_CONFIGS } from "@/constants/code-preview";

export function useTabConfig(content: CodeContent, hasTypeScript = false) {
  const availableTabs = useMemo(() => {
    return TAB_CONFIGS.filter((tab) => {
      // Special handling for JSX vs TSX
      if (tab.id === "jsx" && hasTypeScript) {
        return false; // Hide JSX tab if TypeScript is available
      }
      if (tab.id === "tsx" && !hasTypeScript) {
        return false; // Hide TSX tab if no TypeScript
      }

      return tab.isVisible(content);
    });
  }, [content, hasTypeScript]);

  const getTabContent = useCallback(
    (tabId: string): string => {
      const tab = TAB_CONFIGS.find((t) => t.id === tabId);
      return tab ? tab.getContent(content) : "";
    },
    [content],
  );

  const getTabConfig = useCallback((tabId: string): TabConfig | undefined => {
    return TAB_CONFIGS.find((t) => t.id === tabId);
  }, []);

  const getDefaultTab = useCallback((): string => {
    if (availableTabs.length === 0) return "";

    // Priority order: TSX > JSX > CSS > TypeScript > HTML
    const priorityOrder = ["tsx", "jsx", "css", "typescript", "html"];

    for (const tabId of priorityOrder) {
      if (availableTabs.some((tab) => tab.id === tabId)) {
        return tabId;
      }
    }

    return availableTabs[0].id;
  }, [availableTabs]);

  const getFileName = useCallback(
    (tabId: string, componentName: string): string => {
      const tab = getTabConfig(tabId);
      if (!tab) return `${componentName}.txt`;

      return `${componentName}${tab.extension}`;
    },
    [getTabConfig],
  );

  const isTabEmpty = useCallback(
    (tabId: string): boolean => {
      const content = getTabContent(tabId);
      return !content.trim();
    },
    [getTabContent],
  );

  const getTabStats = useCallback(
    (tabId: string) => {
      const content = getTabContent(tabId);
      const lines = content.split("\n").length;
      const characters = content.length;
      const words = content.trim().split(/\s+/).filter(Boolean).length;

      return { lines, characters, words };
    },
    [getTabContent],
  );

  return {
    availableTabs,
    getTabContent,
    getTabConfig,
    getDefaultTab,
    getFileName,
    isTabEmpty,
    getTabStats,
  };
}
