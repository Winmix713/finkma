/**
 * Memoized syntax highlighter wrapper component
 */

import { memo, Suspense, lazy } from "react";
import type { SyntaxTheme } from "@/types/code-preview";
import { SYNTAX_THEMES, ARIA_LABELS } from "@/constants/code-preview";

// Lazy load syntax highlighter for better performance
const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter").then((module) => ({
    default: module.Prism,
  })),
);

interface SyntaxHighlighterWrapperProps {
  /** Code content to highlight */
  code: string;
  /** Programming language */
  language: string;
  /** Theme for syntax highlighting */
  theme: SyntaxTheme;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Maximum height for the container */
  maxHeight?: string;
  /** Custom CSS classes */
  className?: string;
  /** Whether to wrap long lines */
  wrapLines?: boolean;
}

const SyntaxHighlighterWrapperComponent = memo<SyntaxHighlighterWrapperProps>(
  ({
    code,
    language,
    theme,
    showLineNumbers = true,
    maxHeight = "400px",
    className = "",
    wrapLines = true,
  }) => {
    const syntaxTheme = SYNTAX_THEMES[theme] || SYNTAX_THEMES.light;

    return (
      <div
        className={`relative overflow-hidden rounded-lg border ${className}`}
        style={{ maxHeight }}
        role="region"
        aria-label={ARIA_LABELS.CODE_PREVIEW}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-800">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Loading syntax highlighter...
              </span>
            </div>
          }
        >
          <SyntaxHighlighter
            language={language}
            style={syntaxTheme}
            showLineNumbers={showLineNumbers}
            wrapLines={wrapLines}
            customStyle={{
              margin: 0,
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              maxHeight,
              overflow: "auto",
            }}
            codeTagProps={{
              role: "code",
            }}
            lineNumberStyle={{
              minWidth: "3em",
              paddingRight: "1em",
              color: theme === "dark" ? "#6b7280" : "#9ca3af",
              userSelect: "none",
            }}
          >
            {code}
          </SyntaxHighlighter>
        </Suspense>
      </div>
    );
  },
);

SyntaxHighlighterWrapperComponent.displayName = "SyntaxHighlighterWrapper";

export { SyntaxHighlighterWrapperComponent as SyntaxHighlighterWrapper };
