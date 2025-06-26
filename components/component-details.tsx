"use client"

import { Suspense, lazy } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Download, AlertTriangle, CheckCircle } from "lucide-react"
import type { GeneratedComponent } from "@/types/figma"
import type { CodeGenerationOptions } from "@/services/advanced-code-generator"

// Lazy load syntax highlighter for better performance
const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter").then((module) => ({
    default: module.Prism,
  })),
)

interface ComponentDetailsProps {
  component: GeneratedComponent
  options: CodeGenerationOptions
  activeTab: string
  onTabChange: (tab: string) => void
  onCopy: (content: string, type: string) => void
  onDownload: (content: string, filename: string) => void
  copied: string | null
}

export function ComponentDetails({
  component,
  options,
  activeTab,
  onTabChange,
  onCopy,
  onDownload,
  copied,
}: ComponentDetailsProps) {
  const getFileExtension = (type: string) => {
    switch (type) {
      case "jsx":
        return options.typescript ? ".tsx" : ".jsx"
      case "css":
        return ".css"
      case "typescript":
        return ".d.ts"
      default:
        return ".txt"
    }
  }

  const getContent = (type: string) => {
    switch (type) {
      case "jsx":
        return component.jsx
      case "css":
        return component.css
      case "typescript":
        return component.typescript || ""
      default:
        return ""
    }
  }

  const getLanguage = (type: string) => {
    switch (type) {
      case "jsx":
        return options.typescript ? "tsx" : "jsx"
      case "css":
        return "css"
      case "typescript":
        return "typescript"
      default:
        return "text"
    }
  }

  return (
    <div className="space-y-6">
      {/* Quality Metrics */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-3">Minőségi Mutatók</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Accessibility</span>
              <span className="text-sm font-medium">{component.accessibility.score}%</span>
            </div>
            <Progress value={component.accessibility.score} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Vizuális Pontosság</span>
              <span className="text-sm font-medium">{component.metadata.estimatedAccuracy}%</span>
            </div>
            <Progress value={component.metadata.estimatedAccuracy} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Responsive</span>
              <span className="text-sm font-medium">{component.responsive.hasResponsiveDesign ? "100%" : "0%"}</span>
            </div>
            <Progress value={component.responsive.hasResponsiveDesign ? 100 : 0} className="h-2" />
          </div>
        </div>
      </div>

      {/* Code Display */}
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="jsx">{options.typescript ? "TSX" : "JSX"}</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            {options.typescript && component.typescript && <TabsTrigger value="typescript">Types</TabsTrigger>}
          </TabsList>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(getContent(activeTab), activeTab)}
              disabled={!getContent(activeTab)}
            >
              <Copy className="w-4 h-4 mr-1" />
              {copied === activeTab ? "Másolva!" : "Másolás"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(getContent(activeTab), `${component.name}${getFileExtension(activeTab)}`)}
              disabled={!getContent(activeTab)}
            >
              <Download className="w-4 h-4 mr-1" />
              Letöltés
            </Button>
          </div>
        </div>

        <TabsContent value="jsx">
          <div className="max-h-96 overflow-auto rounded-lg border">
            <Suspense fallback={<div className="p-4">Loading syntax highlighter...</div>}>
              <SyntaxHighlighter
                language={getLanguage("jsx")}
                style={{
                  'code[class*="language-"]': {
                    color: "#f8f8f2",
                    background: "none",
                    textShadow: "0 1px rgba(0, 0, 0, 0.3)",
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
                    textShadow: "0 1px rgba(0, 0, 0, 0.3)",
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
                }}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                }}
                showLineNumbers
                wrapLines
              >
                {component.jsx}
              </SyntaxHighlighter>
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="css">
          <div className="max-h-96 overflow-auto rounded-lg border">
            <Suspense fallback={<div className="p-4">Loading syntax highlighter...</div>}>
              <SyntaxHighlighter
                language="css"
                style={{
                  'code[class*="language-"]': {
                    color: "#f8f8f2",
                    background: "none",
                    textShadow: "0 1px rgba(0, 0, 0, 0.3)",
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
                    textShadow: "0 1px rgba(0, 0, 0, 0.3)",
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
                }}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                }}
                showLineNumbers
                wrapLines
              >
                {component.css}
              </SyntaxHighlighter>
            </Suspense>
          </div>
        </TabsContent>

        {options.typescript && component.typescript && (
          <TabsContent value="typescript">
            <div className="max-h-96 overflow-auto rounded-lg border">
              <Suspense fallback={<div className="p-4">Loading syntax highlighter...</div>}>
                <SyntaxHighlighter
                  language="typescript"
                  style={{
                    'code[class*="language-"]': {
                      color: "#f8f8f2",
                      background: "none",
                      textShadow: "0 1px rgba(0, 0, 0, 0.3)",
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
                      textShadow: "0 1px rgba(0, 0, 0, 0.3)",
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
                  }}
                  customStyle={{
                    margin: 0,
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                  showLineNumbers
                  wrapLines
                >
                  {component.typescript}
                </SyntaxHighlighter>
              </Suspense>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Accessibility Issues */}
      {component.accessibility.issues.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <h4 className="font-semibold mb-2">Accessibility Problémák</h4>
            <div className="space-y-2">
              {component.accessibility.issues.map((issue, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium">{issue.message}</div>
                  <div className="text-gray-600">Javítás: {issue.fix}</div>
                  {issue.wcagRule && <div className="text-xs text-gray-500">WCAG szabály: {issue.wcagRule}</div>}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Suggestions */}
      {component.accessibility.suggestions.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Javaslatok</h4>
          <ul className="space-y-1">
            {component.accessibility.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-blue-700 flex items-start">
                <CheckCircle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-2">Teljesítmény Mutatók</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium text-green-700">Bundle méret</div>
            <div className="text-green-600">{Math.round(component.performance.bundleSize / 1024)} KB</div>
          </div>
          <div>
            <div className="font-medium text-green-700">Render idő</div>
            <div className="text-green-600">{component.performance.renderTime}ms</div>
          </div>
          <div>
            <div className="font-medium text-green-700">Memória</div>
            <div className="text-green-600">{Math.round(component.performance.memoryUsage / 1024)} KB</div>
          </div>
          <div>
            <div className="font-medium text-green-700">Re-render</div>
            <div className="text-green-600">{component.performance.reRenderCount}x</div>
          </div>
        </div>
      </div>
    </div>
  )
}
