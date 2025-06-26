"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileInfoPanel } from "./display/file-info-panel"
import { StatisticsDashboard } from "./display/statistics-dashboard"
import { NodeTreeExplorer } from "./display/node-tree-explorer"
import { QualityReport } from "./quality/quality-report"
import { ProcessingPipeline } from "./processing/processing-pipeline"
import { AccessibilityAudit } from "./quality/accessibility-audit"
import { PerformanceMetrics } from "./quality/performance-metrics"
import { ComponentBrowser } from "./display/component-browser"
import { StyleAnalyzer } from "./display/style-analyzer"
import { ExportManager } from "./export/export-manager"
import { AdvancedSearch } from "./search/advanced-search"
import { FigmaAnalyzer } from "../services/figma-analyzer"
import { FileText, BarChart3, Search, Settings, Download, RefreshCw, AlertCircle } from "lucide-react"
import type { FigmaApiResponse } from "../types/figma-api"
import type { FigmaFileAnalysis, ProcessingStatus, InteractionState } from "../types/figma-info-display"

interface FigmaInfoDisplayProps {
  figmaData: FigmaApiResponse | null
  isLoading?: boolean
  error?: string | null
  onRefresh?: () => void
}

export function FigmaInfoDisplay({ figmaData, isLoading = false, error = null, onRefresh }: FigmaInfoDisplayProps) {
  const [analysis, setAnalysis] = useState<FigmaFileAnalysis | null>(null)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null)
  const [interactionState, setInteractionState] = useState<InteractionState>({
    selectedNodes: [],
    expandedNodes: new Set(),
    collapsedNodes: new Set(),
    searchQuery: "",
    searchResults: [],
    activeFilters: [],
  })
  const [analyzer] = useState(() => new FigmaAnalyzer())

  useEffect(() => {
    if (figmaData) {
      analyzeFile()
    }
  }, [figmaData])

  const analyzeFile = async () => {
    if (!figmaData) return

    setProcessingStatus({
      id: `analysis-${Date.now()}`,
      stage: "Analyzing",
      progress: 0,
      message: "Starting analysis...",
      startTime: new Date(),
      errors: [],
      warnings: [],
    })

    try {
      const result = await analyzer.analyzeFigmaFile(figmaData, {
        includeAccessibility: true,
        includePerformance: true,
        includeQuality: true,
      })

      setAnalysis(result)
      setProcessingStatus((prev) =>
        prev
          ? {
              ...prev,
              stage: "Completed",
              progress: 100,
              message: "Analysis completed successfully",
            }
          : null,
      )
    } catch (error) {
      setProcessingStatus((prev) =>
        prev
          ? {
              ...prev,
              stage: "Error",
              progress: 0,
              message: "Analysis failed",
              errors: [error instanceof Error ? error.message : "Unknown error"],
            }
          : null,
      )
    }
  }

  const handleNodeSelection = (nodeIds: string[]) => {
    setInteractionState((prev) => ({
      ...prev,
      selectedNodes: nodeIds,
    }))
  }

  const handleNodeExpansion = (nodeId: string, expanded: boolean) => {
    setInteractionState((prev) => {
      const newExpandedNodes = new Set(prev.expandedNodes)
      const newCollapsedNodes = new Set(prev.collapsedNodes)

      if (expanded) {
        newExpandedNodes.add(nodeId)
        newCollapsedNodes.delete(nodeId)
      } else {
        newExpandedNodes.delete(nodeId)
        newCollapsedNodes.add(nodeId)
      }

      return {
        ...prev,
        expandedNodes: newExpandedNodes,
        collapsedNodes: newCollapsedNodes,
      }
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading Figma file...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Failed to load Figma file</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // No data state
  if (!figmaData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No Figma file loaded</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Processing Status */}
      {processingStatus && <ProcessingPipeline status={processingStatus} onRestart={analyzeFile} />}

      {/* Main Content */}
      {analysis && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="structure" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Structure
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Quality
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <FileInfoPanel fileInfo={analysis.fileInfo} />
              </div>
              <div className="lg:col-span-2">
                <StatisticsDashboard statistics={analysis.statistics} qualityMetrics={analysis.qualityMetrics} />
              </div>
            </div>
          </TabsContent>

          {/* Structure Tab */}
          <TabsContent value="structure" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <NodeTreeExplorer
                nodeTree={analysis.nodeTree}
                selectedNodes={interactionState.selectedNodes}
                expandedNodes={interactionState.expandedNodes}
                searchQuery={interactionState.searchQuery}
                searchResults={interactionState.searchResults}
                onNodeSelection={handleNodeSelection}
                onNodeExpansion={handleNodeExpansion}
              />
              <div className="space-y-6">
                <ComponentBrowser
                  components={analysis.components}
                  onComponentSelect={(id) => console.log("Component selected:", id)}
                />
                <StyleAnalyzer styles={analysis.styles} onStyleSelect={(id) => console.log("Style selected:", id)} />
              </div>
            </div>
          </TabsContent>

          {/* Quality Tab */}
          <TabsContent value="quality" className="space-y-6">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <QualityReport qualityMetrics={analysis.qualityMetrics} />
              </TabsContent>

              <TabsContent value="accessibility">
                <AccessibilityAudit accessibility={analysis.accessibility} />
              </TabsContent>

              <TabsContent value="performance">
                <PerformanceMetrics performance={analysis.performance} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <AdvancedSearch
              onSearch={(query) => console.log("Search:", query)}
              onSaveSearch={(query, name) => console.log("Save search:", name, query)}
            />
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export">
            <ExportManager onExport={(config) => console.log("Export:", config)} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>Configure how the information is displayed</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
