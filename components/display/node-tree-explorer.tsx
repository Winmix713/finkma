"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  EyeOff,
  Lock,
  Component,
  Type,
  Square,
  Circle,
  ImageIcon,
  Layers,
} from "lucide-react"
import type { FigmaNode, SearchFilter } from "@/types/figma"

interface NodeTreeExplorerProps {
  document: FigmaNode
  onNodeSelect?: (node: FigmaNode) => void
  selectedNodeId?: string
}

export function NodeTreeExplorer({ document, onNodeSelect, selectedNodeId }: NodeTreeExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([document.id]))
  const [filters, setFilters] = useState<SearchFilter>({})
  const [showFilters, setShowFilters] = useState(false)

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case "COMPONENT":
      case "COMPONENT_SET":
        return <Component className="w-4 h-4 text-blue-600" />
      case "INSTANCE":
        return <Component className="w-4 h-4 text-purple-600" />
      case "TEXT":
        return <Type className="w-4 h-4 text-green-600" />
      case "RECTANGLE":
      case "FRAME":
        return <Square className="w-4 h-4 text-orange-600" />
      case "ELLIPSE":
        return <Circle className="w-4 h-4 text-pink-600" />
      case "IMAGE":
        return <ImageIcon className="w-4 h-4 text-indigo-600" />
      case "GROUP":
        return <Layers className="w-4 h-4 text-gray-600" />
      default:
        return <Square className="w-4 h-4 text-gray-400" />
    }
  }

  const getNodeTypeColor = (nodeType: string) => {
    const colors = {
      COMPONENT: "bg-blue-100 text-blue-800",
      INSTANCE: "bg-purple-100 text-purple-800",
      TEXT: "bg-green-100 text-green-800",
      FRAME: "bg-orange-100 text-orange-800",
      GROUP: "bg-gray-100 text-gray-800",
      IMAGE: "bg-indigo-100 text-indigo-800",
    }
    return colors[nodeType as keyof typeof colors] || "bg-gray-100 text-gray-600"
  }

  const filteredNodes = useMemo(() => {
    const filterNode = (node: FigmaNode): boolean => {
      // Search query filter
      if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Node type filter
      if (filters.nodeType && filters.nodeType.length > 0 && !filters.nodeType.includes(node.type)) {
        return false
      }

      // Visibility filter
      if (filters.visible !== undefined && node.visible !== filters.visible) {
        return false
      }

      // Locked filter
      if (filters.locked !== undefined && node.locked !== filters.locked) {
        return false
      }

      // Has children filter
      if (filters.hasChildren !== undefined) {
        const hasChildren = node.children && node.children.length > 0
        if (hasChildren !== filters.hasChildren) {
          return false
        }
      }

      return true
    }

    const filterTree = (node: FigmaNode): FigmaNode | null => {
      const filteredChildren = node.children?.map((child) => filterTree(child)).filter(Boolean) as FigmaNode[]

      if (filterNode(node) || (filteredChildren && filteredChildren.length > 0)) {
        return {
          ...node,
          children: filteredChildren,
        }
      }

      return null
    }

    return filterTree(document)
  }, [document, searchQuery, filters])

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const expandAll = () => {
    const allNodeIds = new Set<string>()
    const collectIds = (node: FigmaNode) => {
      allNodeIds.add(node.id)
      node.children?.forEach(collectIds)
    }
    collectIds(document)
    setExpandedNodes(allNodeIds)
  }

  const collapseAll = () => {
    setExpandedNodes(new Set([document.id]))
  }

  const renderNode = (node: FigmaNode, depth = 0) => {
    if (!node) return null

    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedNodeId === node.id

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center space-x-2 py-1 px-2 rounded cursor-pointer hover:bg-gray-50 ${
            isSelected ? "bg-blue-50 border border-blue-200" : ""
          }`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => onNodeSelect?.(node)}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-4 h-4 p-0"
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(node.id)
              }}
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </Button>
          ) : (
            <div className="w-4 h-4" />
          )}

          {getNodeIcon(node.type)}

          <span className="flex-1 text-sm truncate" title={node.name}>
            {node.name}
          </span>

          <div className="flex items-center space-x-1">
            <Badge variant="secondary" className={`text-xs ${getNodeTypeColor(node.type)}`}>
              {node.type}
            </Badge>

            {node.visible === false && <EyeOff className="w-3 h-3 text-gray-400" />}
            {node.locked && <Lock className="w-3 h-3 text-red-400" />}
          </div>
        </div>

        {hasChildren && isExpanded && <div>{node.children?.map((child) => renderNode(child, depth + 1))}</div>}
      </div>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Node Tree</span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </CardTitle>

        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>

            {Object.keys(filters).length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setFilters({})} className="text-red-600">
                Clear Filters
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
              <div>
                <label className="text-sm font-medium">Node Types:</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {["COMPONENT", "INSTANCE", "TEXT", "FRAME", "GROUP", "IMAGE"].map((type) => (
                    <Badge
                      key={type}
                      variant={filters.nodeType?.includes(type) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => {
                        const currentTypes = filters.nodeType || []
                        const newTypes = currentTypes.includes(type)
                          ? currentTypes.filter((t) => t !== type)
                          : [...currentTypes, type]
                        setFilters({ ...filters, nodeType: newTypes.length > 0 ? newTypes : undefined })
                      }}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.visible === true}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        visible: e.target.checked ? true : undefined,
                      })
                    }
                  />
                  <span className="text-sm">Visible only</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.locked === false}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        locked: e.target.checked ? false : undefined,
                      })
                    }
                  />
                  <span className="text-sm">Unlocked only</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.hasChildren === true}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        hasChildren: e.target.checked ? true : undefined,
                      })
                    }
                  />
                  <span className="text-sm">Has children</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {filteredNodes ? (
            renderNode(filteredNodes)
          ) : (
            <div className="p-4 text-center text-gray-500">No nodes match the current filters</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
