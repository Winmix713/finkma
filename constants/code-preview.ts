/**
 * Constants and configuration for the CodePreview component
 */

import type { TabConfig, SyntaxTheme } from "@/types/code-preview"

export const DEFAULT_COMPONENT_NAME = "Component"

export const SUCCESS_TIMEOUT = 2000

export const ERROR_TIMEOUT = 5000

export const KEYBOARD_SHORTCUTS = {
  COPY: "ctrl+c",
  DOWNLOAD: "ctrl+s",
  NEXT_TAB: "ctrl+right",
  PREV_TAB: "ctrl+left",
} as const

export const TAB_CONFIGS: TabConfig[] = [
  {
    id: "jsx",
    label: "JSX",
    language: "jsx",
    extension: ".jsx",
    getContent: (content) => content.jsx || "",
    isVisible: (content) => !!content.jsx,
  },
  {
    id: "tsx",
    label: "TSX",
    language: "tsx",
    extension: ".tsx",
    getContent: (content) => content.jsx || "",
    isVisible: (content) => !!content.jsx && !!content.typescript,
  },
  {
    id: "css",
    label: "CSS",
    language: "css",
    extension: ".css",
    getContent: (content) => content.css || "",
    isVisible: (content) => !!content.css,
  },
  {
    id: "typescript",
    label: "Types",
    language: "typescript",
    extension: ".d.ts",
    getContent: (content) => content.typescript || "",
    isVisible: (content) => !!content.typescript,
  },
  {
    id: "html",
    label: "HTML",
    language: "html",
    extension: ".html",
    getContent: (content) => content.html || "",
    isVisible: (content) => !!content.html,
  },
]

export const SYNTAX_THEMES: Record<SyntaxTheme, any> = {
  light: {
    'code[class*="language-"]': {
      color: "#24292e",
      background: "none",
      fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
      fontSize: "1em",
      textAlign: "left",
      whiteSpace: "pre",
      wordSpacing: "normal",
      wordBreak: "normal",
      wordWrap: "normal",
      lineHeight: "1.5",
      tabSize: "4",
      hyphens: "none",
    },
    'pre[class*="language-"]': {
      color: "#24292e",
      background: "#f6f8fa",
      fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
      fontSize: "1em",
      textAlign: "left",
      whiteSpace: "pre",
      wordSpacing: "normal",
      wordBreak: "normal",
      wordWrap: "normal",
      lineHeight: "1.5",
      tabSize: "4",
      hyphens: "none",
      padding: "1em",
      margin: "0.5em 0",
      overflow: "auto",
      borderRadius: "0.3em",
    },
  },
  dark: {
    'code[class*="language-"]': {
      color: "#f8f8f2",
      background: "none",
      fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
      fontSize: "1em",
      textAlign: "left",
      whiteSpace: "pre",
      wordSpacing: "normal",
      wordBreak: "normal",
      wordWrap: "normal",
      lineHeight: "1.5",
      tabSize: "4",
      hyphens: "none",
    },
    'pre[class*="language-"]': {
      color: "#f8f8f2",
      background: "#2d3748",
      fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
      fontSize: "1em",
      textAlign: "left",
      whiteSpace: "pre",
      wordSpacing: "normal",
      wordBreak: "normal",
      wordWrap: "normal",
      lineHeight: "1.5",
      tabSize: "4",
      hyphens: "none",
      padding: "1em",
      margin: "0.5em 0",
      overflow: "auto",
      borderRadius: "0.3em",
    },
  },
  "high-contrast": {
    'code[class*="language-"]': {
      color: "#ffffff",
      background: "none",
      fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
      fontSize: "1em",
      textAlign: "left",
      whiteSpace: "pre",
      wordSpacing: "normal",
      wordBreak: "normal",
      wordWrap: "normal",
      lineHeight: "1.5",
      tabSize: "4",
      hyphens: "none",
    },
    'pre[class*="language-"]': {
      color: "#ffffff",
      background: "#000000",
      fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
      fontSize: "1em",
      textAlign: "left",
      whiteSpace: "pre",
      wordSpacing: "normal",
      wordBreak: "normal",
      wordWrap: "normal",
      lineHeight: "1.5",
      tabSize: "4",
      hyphens: "none",
      padding: "1em",
      margin: "0.5em 0",
      overflow: "auto",
      borderRadius: "0.3em",
      border: "2px solid #ffffff",
    },
  },
}

export const ERROR_MESSAGES = {
  CLIPBOARD_NOT_SUPPORTED: "Clipboard API is not supported in this browser",
  CLIPBOARD_PERMISSION_DENIED: "Clipboard access was denied",
  CLIPBOARD_FAILED: "Failed to copy to clipboard",
  DOWNLOAD_FAILED: "Failed to download file",
  INVALID_CONTENT: "Invalid content provided",
  THEME_DETECTION_FAILED: "Failed to detect system theme",
} as const

export const SUCCESS_MESSAGES = {
  COPIED_TO_CLIPBOARD: "Copied to clipboard!",
  FILE_DOWNLOADED: "File downloaded successfully!",
} as const

export const ARIA_LABELS = {
  CODE_PREVIEW: "Code preview with syntax highlighting",
  TAB_LIST: "Code file tabs",
  TAB_PANEL: "Code content panel",
  COPY_BUTTON: "Copy code to clipboard",
  DOWNLOAD_BUTTON: "Download code file",
  THEME_TOGGLE: "Toggle theme",
  LINE_NUMBERS: "Line numbers",
} as const
