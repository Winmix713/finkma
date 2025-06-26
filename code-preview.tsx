"use client"

/**
 * Main CodePreview component - Production-ready code preview with syntax highlighting
 */

import { useState, useCallback, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

import type { CodePreviewProps, CodePreviewError } from "@/types/code-preview"
import { DEFAULT_COMPONENT_NAME, ARIA_LABELS } from "@/constants/code-preview"

import { useClipboard } from "@/hooks/use-clipboard"
import { useFileDownload } from "@/hooks/use-file-download"
import { useTabConfig } from "@/hooks/use-tab-config"
import { useTheme } from "@/hooks/use-theme"

import { CodePreviewErrorBoundary } from "@/components/error-boundary"
import { SyntaxHighlighterWrapper } from "@/components/syntax-highlighter-wrapper"
import { TabActions } from "@/components/tab-actions"

/**
 * CodePreview Component
 *
 * A comprehensive, production-ready React component for displaying syntax-highlighted code
 * with tabs, copy/download functionality, and full accessibility support.
 *
 * @example
 * \`\`\`tsx
 * <CodePreview
 *   content={{
 *     jsx: "export function Button() { return <button>Click me</button> }",
 *     css: ".button { padding: 8px 16px; }"
 *   }}
 *   componentName="Button"
 *   showLineNumbers={true}
 * />
 * \`\`\`
 */
export function CodePreview({
  content,
  componentName = DEFAULT_COMPONENT_NAME,
  defaultTab,
  theme = "auto",
  showLineNumbers = true,
  maxHeight = "400px",
  className = "",
  onTabChange,
  onCopy,
  onDownload,
  onError,
}: CodePreviewProps) {
  // Theme management
  const { theme: currentTheme, getSyntaxTheme, getReducedMotion } = useTheme(theme)

  // Tab configuration
  const hasTypeScript = !!(content.typescript || (content.jsx && content.jsx.includes("interface ")))
  const { availableTabs, getTabContent, getDefaultTab, getFileName, isTabEmpty } = useTabConfig(content, hasTypeScript)

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>(() => {
    return defaultTab && availableTabs.some((tab) => tab.id === defaultTab) ? defaultTab : getDefaultTab()
  })

  // Clipboard and download hooks
  const clipboard = useClipboard()
  const download = useFileDownload()

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Update active tab when available tabs change
  useEffect(() => {
    if (!availableTabs.some((tab) => tab.id === activeTab)) {
      const newTab = getDefaultTab()
      setActiveTab(newTab)
      onTabChange?.(newTab)
    }
  }, [availableTabs, activeTab, getDefaultTab, onTabChange])

  // Handle tab change
  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId)
      onTabChange?.(tabId)
      setError(null) // Clear any previous errors
    },
    [onTabChange],
  )

  // Handle copy operation
  const handleCopy = useCallback(
    async (content: string, tabId: string) => {
      try {
        await clipboard.copyToClipboard(content, tabId)
        onCopy?.(content, tabId)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Copy failed"
        setError(errorMessage)
        onError?.(error as CodePreviewError)
      }
    },
    [clipboard, onCopy, onError],
  )

  // Handle download operation
  const handleDownload = useCallback(
    async (content: string, filename: string) => {
      try {
        const extension = filename.substring(filename.lastIndexOf("."))
        await download.downloadWithExtension(content, filename, extension)
        onDownload?.(filename, content)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Download failed"
        setError(errorMessage)
        onError?.(error as CodePreviewError)
      }
    },
    [download, onDownload, onError],
  )

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
        const currentContent = getTabContent(activeTab)

        switch (event.key.toLowerCase()) {
          case "c":
            if (currentContent.trim()) {
              event.preventDefault()
              handleCopy(currentContent, activeTab)
            }
            break
          case "s":
            if (currentContent.trim()) {
              event.preventDefault()
              const filename = getFileName(activeTab, componentName)
              handleDownload(currentContent, filename)
            }
            break
        }
      }
    },
    [activeTab, getTabContent, getFileName, componentName, handleCopy, handleDownload],
  )

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clipboard.cleanup()
      download.cleanup()
    }
  }, [clipboard, download])

  // Memoized values
  const syntaxTheme = useMemo(() => getSyntaxTheme(), [getSyntaxTheme])
  const reduceMotion = useMemo(() => getReducedMotion(), [getReducedMotion])

  // Early return if no tabs available
  if (availableTabs.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No code content available to display.</AlertDescription>
      </Alert>
    )
  }

  return (
    <CodePreviewErrorBoundary onError={onError}>
      <div
        className={`code-preview w-full ${className}`}
        data-theme={currentTheme}
        data-reduce-motion={reduceMotion}
        data-testid="code-preview"
      >
        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Tab list */}
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-auto grid-cols-auto gap-1" role="tablist" aria-label={ARIA_LABELS.TAB_LIST}>
              {availableTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="relative"
                  disabled={isTabEmpty(tab.id)}
                  aria-controls={`panel-${tab.id}`}
                  aria-selected={activeTab === tab.id}
                >
                  {tab.label}
                  {isTabEmpty(tab.id) && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      Empty
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab actions */}
            <TabActions
              tabId={activeTab}
              content={getTabContent(activeTab)}
              filename={getFileName(activeTab, componentName)}
              isCopying={clipboard.isLoading}
              isDownloading={download.isLoading}
              copySuccess={clipboard.success === activeTab}
              downloadSuccess={download.success}
              onCopy={handleCopy}
              onDownload={handleDownload}
              disabled={isTabEmpty(activeTab)}
            />
          </div>

          {/* Tab panels */}
          {availableTabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="mt-0"
              role="tabpanel"
              id={`panel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
              aria-label={`${ARIA_LABELS.TAB_PANEL} for ${tab.label}`}
            >
              <SyntaxHighlighterWrapper
                code={getTabContent(tab.id)}
                language={tab.language}
                theme={syntaxTheme}
                showLineNumbers={showLineNumbers}
                maxHeight={maxHeight}
                className="border-0"
              />
            </TabsContent>
          ))}
        </Tabs>

        {/* Keyboard shortcuts help (screen reader only) */}
        <div className="sr-only" role="region" aria-label="Keyboard shortcuts">
          <p>Keyboard shortcuts: Ctrl+C to copy, Ctrl+S to download current tab</p>
        </div>
      </div>
    </CodePreviewErrorBoundary>
  )
}

// Export with error boundary HOC for additional safety
export default CodePreview
