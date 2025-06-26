"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, Package, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface ExportManagerProps {
  onExport?: (config: ExportConfiguration) => void
  exportHistory?: ExportHistoryItem[]
}

interface ExportConfiguration {
  format: "json" | "csv" | "xlsx" | "pdf" | "html" | "markdown" | "figma-tokens"
  options: {
    includeMetadata: boolean
    includeQualityMetrics: boolean
    includeAccessibilityReport: boolean
    includePerformanceMetrics: boolean
    includeRecommendations: boolean
    includeCodeGeneration: boolean
    compression: "none" | "gzip" | "brotli"
    formatting: "minified" | "pretty"
  }
  destination: {
    type: "download" | "email" | "webhook" | "cloud-storage"
    config: Record<string, any>
  }
}

interface ExportHistoryItem {
  id: string
  format: string
  timestamp: Date
  status: "completed" | "failed" | "in-progress"
  size: number
  downloadUrl?: string
}

export function ExportManager({ onExport, exportHistory = [] }: ExportManagerProps) {
  const [exportConfig, setExportConfig] = useState<ExportConfiguration>({
    format: "json",
    options: {
      includeMetadata: true,
      includeQualityMetrics: true,
      includeAccessibilityReport: false,
      includePerformanceMetrics: false,
      includeRecommendations: true,
      includeCodeGeneration: false,
      compression: "none",
      formatting: "pretty",
    },
    destination: {
      type: "download",
      config: {},
    },
  })

  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsExporting(false)
          return 100
        }
        return prev + 10
      })
    }, 200)

    onExport?.(exportConfig)
  }

  const updateExportOption = (key: keyof ExportConfiguration["options"], value: any) => {
    setExportConfig((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [key]: value,
      },
    }))
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "json":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "csv":
        return <FileText className="h-4 w-4 text-green-600" />
      case "xlsx":
        return <FileText className="h-4 w-4 text-green-700" />
      case "pdf":
        return <FileText className="h-4 w-4 text-red-600" />
      case "html":
        return <FileText className="h-4 w-4 text-orange-600" />
      case "markdown":
        return <FileText className="h-4 w-4 text-purple-600" />
      case "figma-tokens":
        return <Package className="h-4 w-4 text-pink-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Configuration
          </CardTitle>
          <CardDescription>Configure your export settings and download options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Export Format</label>
            <Select
              value={exportConfig.format}
              onValueChange={(value: any) => setExportConfig((prev) => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    {getFormatIcon("json")}
                    JSON - Structured data format
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    {getFormatIcon("csv")}
                    CSV - Comma-separated values
                  </div>
                </SelectItem>
                <SelectItem value="xlsx">
                  <div className="flex items-center gap-2">
                    {getFormatIcon("xlsx")}
                    Excel - Spreadsheet format
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    {getFormatIcon("pdf")}
                    PDF - Printable report
                  </div>
                </SelectItem>
                <SelectItem value="html">
                  <div className="flex items-center gap-2">
                    {getFormatIcon("html")}
                    HTML - Web-ready report
                  </div>
                </SelectItem>
                <SelectItem value="markdown">
                  <div className="flex items-center gap-2">
                    {getFormatIcon("markdown")}
                    Markdown - Documentation format
                  </div>
                </SelectItem>
                <SelectItem value="figma-tokens">
                  <div className="flex items-center gap-2">
                    {getFormatIcon("figma-tokens")}
                    Figma Tokens - Design tokens
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Include in Export</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={exportConfig.options.includeMetadata}
                  onCheckedChange={(checked) => updateExportOption("includeMetadata", checked)}
                />
                <label htmlFor="metadata" className="text-sm">
                  File metadata
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="quality"
                  checked={exportConfig.options.includeQualityMetrics}
                  onCheckedChange={(checked) => updateExportOption("includeQualityMetrics", checked)}
                />
                <label htmlFor="quality" className="text-sm">
                  Quality metrics
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accessibility"
                  checked={exportConfig.options.includeAccessibilityReport}
                  onCheckedChange={(checked) => updateExportOption("includeAccessibilityReport", checked)}
                />
                <label htmlFor="accessibility" className="text-sm">
                  Accessibility report
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="performance"
                  checked={exportConfig.options.includePerformanceMetrics}
                  onCheckedChange={(checked) => updateExportOption("includePerformanceMetrics", checked)}
                />
                <label htmlFor="performance" className="text-sm">
                  Performance metrics
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommendations"
                  checked={exportConfig.options.includeRecommendations}
                  onCheckedChange={(checked) => updateExportOption("includeRecommendations", checked)}
                />
                <label htmlFor="recommendations" className="text-sm">
                  Recommendations
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="code"
                  checked={exportConfig.options.includeCodeGeneration}
                  onCheckedChange={(checked) => updateExportOption("includeCodeGeneration", checked)}
                />
                <label htmlFor="code" className="text-sm">
                  Generated code
                </label>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Compression</label>
              <Select
                value={exportConfig.options.compression}
                onValueChange={(value: any) => updateExportOption("compression", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="gzip">Gzip</SelectItem>
                  <SelectItem value="brotli">Brotli</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Formatting</label>
              <Select
                value={exportConfig.options.formatting}
                onValueChange={(value: any) => updateExportOption("formatting", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pretty">Pretty (readable)</SelectItem>
                  <SelectItem value="minified">Minified (compact)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Export Button */}
          <div className="space-y-4">
            {isExporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Exporting...</span>
                  <span className="text-sm text-muted-foreground">{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            )}

            <Button onClick={handleExport} disabled={isExporting} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export Data"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      {exportHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Export History</CardTitle>
            <CardDescription>Recent exports and downloads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-md border">
                  <div className="flex items-center gap-3">
                    {getFormatIcon(item.format)}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.format.toUpperCase()} Export</p>
                      <p className="text-xs text-muted-foreground">
                        {item.timestamp.toLocaleString()} • {formatFileSize(item.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      <Badge
                        variant={
                          item.status === "completed"
                            ? "default"
                            : item.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {item.status}
                      </Badge>
                    </div>

                    {item.status === "completed" && item.downloadUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={item.downloadUrl} download>
                          <Download className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
