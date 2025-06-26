"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Component, Search, Eye, Copy, ExternalLink, Star } from "lucide-react"

interface ComponentBrowserProps {
  components: Array<{
    id: string
    name: string
    description: string
    type: string
    instances: number
    variants: number
  }>
  onComponentSelect?: (componentId: string) => void
  onComponentPreview?: (componentId: string) => void
}

export function ComponentBrowser({ components, onComponentSelect, onComponentPreview }: ComponentBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [sortBy, setSortBy] = useState<"name" | "instances" | "variants">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Get unique component types
  const componentTypes = useMemo(() => {
    const types = new Set(components.map((comp) => comp.type))
    return Array.from(types).sort()
  }, [components])

  // Filter and sort components
  const filteredComponents = useMemo(() => {
    const filtered = components.filter((component) => {
      const matchesSearch =
        !searchQuery ||
        component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = !selectedType || component.type === selectedType

      return matchesSearch && matchesType
    })

    // Sort components
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case "instances":
          aValue = a.instances
          bValue = b.instances
          break
        case "variants":
          aValue = a.variants
          bValue = b.variants
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [components, searchQuery, selectedType, sortBy, sortOrder])

  const handleSort = (field: "name" | "instances" | "variants") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Component className="h-5 w-5" />
          Component Browser
        </CardTitle>
        <CardDescription>Browse and explore {components.length} components in your design system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            <Button variant={selectedType === "" ? "default" : "outline"} size="sm" onClick={() => setSelectedType("")}>
              All Types
            </Button>
            {componentTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Button variant={sortBy === "name" ? "default" : "outline"} size="sm" onClick={() => handleSort("name")}>
              Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
            </Button>
            <Button
              variant={sortBy === "instances" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("instances")}
            >
              Usage {sortBy === "instances" && (sortOrder === "asc" ? "↑" : "↓")}
            </Button>
            <Button
              variant={sortBy === "variants" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("variants")}
            >
              Variants {sortBy === "variants" && (sortOrder === "asc" ? "↑" : "↓")}
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredComponents.length} of {components.length} components
        </div>

        {/* Component Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComponents.map((component) => (
            <Card key={component.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                {/* Component Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-medium text-sm truncate">{component.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {component.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {component.instances > 10 && <Star className="h-3 w-3 text-yellow-500" />}
                  </div>
                </div>

                {/* Component Description */}
                {component.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{component.description}</p>
                )}

                {/* Component Stats */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{component.instances} instances</span>
                    {component.variants > 0 && (
                      <span className="text-muted-foreground">{component.variants} variants</span>
                    )}
                  </div>
                </div>

                {/* Component Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => onComponentSelect?.(component.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onComponentPreview?.(component.id)}>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(component.id)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredComponents.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <Component className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">No components found matching your criteria</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setSelectedType("")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
