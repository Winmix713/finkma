"use client"

import { useState, useMemo } from "react"
import type { FigmaApiResponse } from "@/types/figma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code2, Download, Settings, FileCode, Eye, Plus, X, AlertTriangle } from "lucide-react"
import { ConfigurationPanel } from "./configuration-panel"
import { CustomCodePanel } from "./custom-code-panel"
import { ComponentList } from "./component-list"
import { ComponentDetails } from "./component-details"
import { ToastContainer } from "./toast-container"
import { useCodeGeneration } from "@/hooks/use-code-generation"

interface CodeGenerationPanelProps {
  figmaData: FigmaApiResponse
  fileKey: string
}

export function CodeGenerationPanel({ figmaData, fileKey }: CodeGenerationPanelProps) {
  const {
    options,
    setOptions,
    customCode,
    setCustomCode,
    isGenerating,
    generatedComponents,
    selectedComponent,
    setSelectedComponent,
    handleGenerate,
    handleCopy,
    handleDownload,
    handleDownloadAll,
    cancelGeneration,
    copied,
    error,
    toasts,
    dismissError,
    removeToast,
  } = useCodeGeneration(figmaData)

  const [showCustomInputs, setShowCustomInputs] = useState(false)
  const [activeTab, setActiveTab] = useState("jsx")

  const hasCustomCode = useMemo(() => !!(customCode.jsx || customCode.css || customCode.cssAdvanced), [customCode])

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>{error.type.charAt(0).toUpperCase() + error.type.slice(1)} Error:</strong> {error.message}
              {error.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">Show details</summary>
                  <pre className="mt-1 text-xs whitespace-pre-wrap">{error.details}</pre>
                </details>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={dismissError}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Kódgenerálási Beállítások</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ConfigurationPanel options={options} onOptionsChange={setOptions} />

          {/* Custom Code Section */}
          <div className="pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCustomInputs(!showCustomInputs)} className="mb-4 w-full">
              <Plus className="w-4 h-4 mr-2" />
              {showCustomInputs ? "Egyéni Kód Elrejtése" : "Egyéni Kód Hozzáadása"}
            </Button>

            {showCustomInputs && <CustomCodePanel customCode={customCode} onCustomCodeChange={setCustomCode} />}

            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Kód Generálása...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Code2 className="w-4 h-4" />
                    <span>Kód Generálása</span>
                  </div>
                )}
              </Button>

              {isGenerating && (
                <Button variant="outline" onClick={cancelGeneration}>
                  Megszakítás
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Components */}
      {generatedComponents.length > 0 && (
        <div className="space-y-6">
          {/* Component List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileCode className="w-5 h-5" />
                  <span>Generált Komponensek ({generatedComponents.length})</span>
                </CardTitle>
                {selectedComponent && (
                  <Button onClick={handleDownloadAll} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Összes Letöltése
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ComponentList
                components={generatedComponents}
                selectedComponent={selectedComponent}
                onSelectComponent={setSelectedComponent}
                hasCustomCode={hasCustomCode}
              />
            </CardContent>
          </Card>

          {/* Selected Component Details */}
          {selectedComponent && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>{selectedComponent.name}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{selectedComponent.metadata.complexity}</Badge>
                    <Badge variant="outline">{selectedComponent.metadata.estimatedAccuracy}% pontosság</Badge>
                    {hasCustomCode && (
                      <Badge variant="default" className="bg-green-600">
                        <Plus className="w-3 h-3 mr-1" />
                        Egyéni kóddal
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ComponentDetails
                  component={selectedComponent}
                  options={options}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  copied={copied}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  )
}
