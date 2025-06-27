/**
 * Core types and interfaces for the CodePreview component
 */

export interface CodeContent {
  /** JSX/TSX code content */
  jsx?: string;
  /** CSS code content */
  css?: string;
  /** TypeScript definitions */
  typescript?: string;
  /** HTML content */
  html?: string;
}

export interface TabConfig {
  /** Unique identifier for the tab */
  id: string;
  /** Display label for the tab */
  label: string;
  /** Programming language for syntax highlighting */
  language: string;
  /** File extension for downloads */
  extension: string;
  /** Content getter function */
  getContent: (content: CodeContent) => string;
  /** Whether the tab should be visible */
  isVisible: (content: CodeContent) => boolean;
}

export interface CodePreviewProps {
  /** Code content to display */
  content: CodeContent;
  /** Component name for file naming */
  componentName?: string;
  /** Default active tab */
  defaultTab?: string;
  /** Theme preference */
  theme?: "light" | "dark" | "auto";
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Maximum height for code display */
  maxHeight?: string;
  /** Custom CSS classes */
  className?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Callback when content is copied */
  onCopy?: (content: string, tabId: string) => void;
  /** Callback when file is downloaded */
  onDownload?: (filename: string, content: string) => void;
  /** Error callback */
  onError?: (error: Error) => void;
}

export interface ClipboardState {
  /** Whether clipboard operation is in progress */
  isLoading: boolean;
  /** Success state with tab ID */
  success: string | null;
  /** Error state */
  error: string | null;
}

export interface DownloadState {
  /** Whether download is in progress */
  isLoading: boolean;
  /** Success state */
  success: boolean;
  /** Error state */
  error: string | null;
}

export interface ThemeState {
  /** Current theme */
  theme: "light" | "dark";
  /** System theme preference */
  systemTheme: "light" | "dark";
  /** User preference */
  userPreference: "light" | "dark" | "auto";
}

export interface CodePreviewError extends Error {
  /** Error type for categorization */
  type: "clipboard" | "download" | "syntax" | "theme" | "unknown";
  /** Additional context */
  context?: Record<string, any>;
}

export type SyntaxTheme = "light" | "dark" | "high-contrast";

export interface AccessibilityOptions {
  /** Whether to announce state changes */
  announceChanges: boolean;
  /** Whether to use high contrast mode */
  highContrast: boolean;
  /** Whether to reduce motion */
  reduceMotion: boolean;
}
