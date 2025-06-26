"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Download, Code, FileText, ImageIcon } from "lucide-react"
import type { ProcessingResult } from "@/types/figma"

interface ExportConfigurationProps {
  results: ProcessingResult[]
  selectedFiles: string[]
  onExport: (format: string, data: any) => void
}

export function ExportConfiguration({ results, selectedFiles, onExport }: ExportConfigurationProps) {
  const [exportFormat, setExportFormat] = useState("json")
  const [includeComponents, setIncludeComponents] = useState(true)
  const [includeStyles, setIncludeStyles] = useState(true)
  const [includeAssets, setIncludeAssets] = useState(false)
  const [codeFramework, setCodeFramework] = useState("react")
  const [codeStyle, setCodeStyle] = useState("typescript")

  const selectedResults = results.filter((r) => selectedFiles.includes(r.id))

  const handleExport = (format: string) => {
    const exportData = {
      files: selectedResults,
      options: {
        includeComponents,
        includeStyles,
        includeAssets,
        framework: codeFramework,
        style: codeStyle,
      },
    }
    onExport(format, exportData)
  }

  const getExportSize = () => {
    let totalNodes = 0
    let totalComponents = 0

    selectedResults.forEach((result) => {
      const countNodes = (node: any): number => {
        let count = 1
        if (node.children) {
          count += node.children.reduce((sum: number, child: any) => sum + countNodes(child), 0)
        }
        return count
      }
      totalNodes += countNodes(result.data.document)
      totalComponents += Object.keys(result.data.components).length
    })

    return { totalNodes, totalComponents }
  }

  const { totalNodes, totalComponents } = getExportSize()

  return (
    <div className="space-y-6">
      {/* Export Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Export Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedFiles.length}</div>
              <div className="text-xs text-gray-600">Files Selected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalNodes}</div>
              <div className="text-xs text-gray-600">Total Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalComponents}</div>
              <div className="text-xs text-gray-600">Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((totalNodes + totalComponents) * 0.1)}KB
              </div>
              <div className="text-xs text-gray-600">Est. Size</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Tabs defaultValue="data" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Data Export</span>
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center space-x-2">
            <Code className="w-4 h-4" />
            <span>Code Generation</span>
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4" />
            <span>Asset Export</span>
          </TabsTrigger>
        </TabsList>

        {/* Data Export */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                    <SelectItem value="csv">CSV (Flat)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-components"
                    checked={includeComponents}
                    onCheckedChange={setIncludeComponents}
                  />
                  <Label htmlFor="include-components">Include Components</Label>
                  <Badge variant="secondary">{totalComponents}</Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="include-styles" checked={includeStyles} onCheckedChange={setIncludeStyles} />
                  <Label htmlFor="include-styles">Include Styles</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="include-assets" checked={includeAssets} onCheckedChange={setIncludeAssets} />
                  <Label htmlFor="include-assets">Include Asset URLs</Label>
                </div>
              </div>

              <Button
                onClick={() => handleExport(exportFormat)}
                disabled={selectedFiles.length === 0}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as {exportFormat.toUpperCase()}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code Generation */}
        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Generation Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Framework</Label>
                  <Select value={codeFramework} onValueChange={setCodeFramework}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="vue">Vue.js</SelectItem>
                      <SelectItem value="angular">Angular</SelectItem>
                      <SelectItem value="html">HTML/CSS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={codeStyle} onValueChange={setCodeStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={() => handleExport("code")} disabled={selectedFiles.length === 0} className="w-full">
                <Code className="w-4 h-4 mr-2" />
                Generate {codeFramework} Code
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asset Export */}
        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Asset Format</Label>
                <Select defaultValue="png">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="svg">SVG</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Resolution</Label>
                <Select defaultValue="2x">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1x">1x (Standard)</SelectItem>
                    <SelectItem value="2x">2x (Retina)</SelectItem>
                    <SelectItem value="3x">3x (High DPI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => handleExport("assets")} disabled={selectedFiles.length === 0} className="w-full">
                <ImageIcon className="w-4 h-4 mr-2" />
                Export Assets
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Files */}
      {selectedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files ({selectedResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm truncate flex-1">{result.data.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {Object.keys(result.data.components).length} components
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
