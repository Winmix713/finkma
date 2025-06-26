"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, User, Eye, Download, Clock, Layers, Palette } from "lucide-react"
import { FigmaAnalyzer } from "@/services/figma-analyzer"
import type { FigmaApiResponse } from "@/types/figma-api"

interface FileInfoPanelProps {
  figmaData: FigmaApiResponse
  className?: string
}

export function FileInfoPanel({ figmaData, className }: FileInfoPanelProps) {
  if (!figmaData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No file data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const analysis = FigmaAnalyzer.analyzeNodes(figmaData.document)
  const styleAnalysis = FigmaAnalyzer.analyzeStyles(figmaData.document, figmaData.styles)
  const qualityMetrics = FigmaAnalyzer.analyzeQuality(figmaData.document, analysis)

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Unknown'
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            File Information
          </CardTitle>
          <CardDescription>
            Basic information about the Figma file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">File Name</p>
                  <p className="text-sm text-gray-600">{figmaData.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Last Modified</p>
                  <p className="text-sm text-gray-600">{formatDate(figmaData.lastModified)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <Badge variant="secondary">{figmaData.role}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Editor Type</p>
                  <p className="text-sm text-gray-600">{figmaData.editorType}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Version</p>
                  <p className="text-sm text-gray-600">{figmaData.version}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Schema Version</p>
                  <p className="text-sm text-gray-600">{figmaData.schemaVersion}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Structure Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Structure Analysis
          </CardTitle>
          <CardDescription>
            Analysis of the file's node structure and composition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analysis.totalNodes}</div>
              <div className="text-sm text-gray-600">Total Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analysis.componentInstances}</div>
              <div className="text-sm text-gray-600">Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analysis.textNodes}</div>
              <div className="text-sm text-gray-600">Text Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{analysis.maxDepth}</div>
              <div className="text-sm text-gray-600">Max Depth</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Node Type Distribution</h4>
            {Object.entries(analysis.nodeTypes)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / analysis.totalNodes) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Style Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Style Analysis
          </CardTitle>
          <CardDescription>
            Colors, typography, and design system usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Colors */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-blue-500 rounded-full" />
\
