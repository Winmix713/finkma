"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, Save, History } from "lucide-react";

interface AdvancedSearchProps {
  onSearch?: (query: SearchQuery) => void;
  onSaveSearch?: (query: SearchQuery, name: string) => void;
  savedSearches?: SavedSearch[];
  searchResults?: SearchResult[];
}

interface SearchQuery {
  text: string;
  filters: {
    nodeTypes: string[];
    properties: Record<string, any>;
    hasChildren: boolean | null;
    isVisible: boolean | null;
    isLocked: boolean | null;
    hasComponent: boolean | null;
    hasStyle: boolean | null;
  };
  sorting: {
    field: "name" | "type" | "depth" | "children";
    order: "asc" | "desc";
  };
}

interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  timestamp: Date;
}

interface SearchResult {
  id: string;
  name: string;
  type: string;
  path: string[];
  matches: string[];
}

export function AdvancedSearch({
  onSearch,
  onSaveSearch,
  savedSearches = [],
  searchResults = [],
}: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    text: "",
    filters: {
      nodeTypes: [],
      properties: {},
      hasChildren: null,
      isVisible: null,
      isLocked: null,
      hasComponent: null,
      hasStyle: null,
    },
    sorting: {
      field: "name",
      order: "asc",
    },
  });

  const [showFilters, setShowFilters] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const nodeTypes = [
    "FRAME",
    "GROUP",
    "COMPONENT",
    "INSTANCE",
    "TEXT",
    "RECTANGLE",
    "ELLIPSE",
    "VECTOR",
    "IMAGE",
    "LINE",
    "STAR",
    "POLYGON",
  ];

  const handleSearch = () => {
    onSearch?.(searchQuery);
  };

  const handleSaveSearch = () => {
    if (saveSearchName.trim()) {
      onSaveSearch?.(searchQuery, saveSearchName.trim());
      setSaveSearchName("");
      setShowSaveDialog(false);
    }
  };

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setSearchQuery(savedSearch.query);
    onSearch?.(savedSearch.query);
  };

  const updateFilter = (key: string, value: any) => {
    setSearchQuery((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value,
      },
    }));
  };

  const toggleNodeType = (nodeType: string) => {
    setSearchQuery((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        nodeTypes: prev.filters.nodeTypes.includes(nodeType)
          ? prev.filters.nodeTypes.filter((t) => t !== nodeType)
          : [...prev.filters.nodeTypes, nodeType],
      },
    }));
  };

  const clearFilters = () => {
    setSearchQuery((prev) => ({
      ...prev,
      filters: {
        nodeTypes: [],
        properties: {},
        hasChildren: null,
        isVisible: null,
        isLocked: null,
        hasComponent: null,
        hasStyle: null,
      },
    }));
  };

  const activeFiltersCount = useMemo(() => {
    const filters = searchQuery.filters;
    let count = 0;

    if (filters.nodeTypes.length > 0) count++;
    if (filters.hasChildren !== null) count++;
    if (filters.isVisible !== null) count++;
    if (filters.isLocked !== null) count++;
    if (filters.hasComponent !== null) count++;
    if (filters.hasStyle !== null) count++;

    return count;
  }, [searchQuery.filters]);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search
          </CardTitle>
          <CardDescription>
            Search through your Figma file with advanced filters and options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search nodes, components, text content..."
                value={searchQuery.text}
                onChange={(e) =>
                  setSearchQuery((prev) => ({ ...prev, text: e.target.value }))
                }
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/50">
              {/* Node Types */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Node Types</label>
                <div className="flex flex-wrap gap-2">
                  {nodeTypes.map((type) => (
                    <Button
                      key={type}
                      variant={
                        searchQuery.filters.nodeTypes.includes(type)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => toggleNodeType(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Boolean Filters */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Has Children</label>
                  <Select
                    value={searchQuery.filters.hasChildren?.toString() || "any"}
                    onValueChange={(value) =>
                      updateFilter(
                        "hasChildren",
                        value === "any" ? null : value === "true",
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Visibility</label>
                  <Select
                    value={searchQuery.filters.isVisible?.toString() || "any"}
                    onValueChange={(value) =>
                      updateFilter(
                        "isVisible",
                        value === "any" ? null : value === "true",
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="true">Visible</SelectItem>
                      <SelectItem value="false">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Lock Status</label>
                  <Select
                    value={searchQuery.filters.isLocked?.toString() || "any"}
                    onValueChange={(value) =>
                      updateFilter(
                        "isLocked",
                        value === "any" ? null : value === "true",
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="true">Locked</SelectItem>
                      <SelectItem value="false">Unlocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sorting */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select
                    value={searchQuery.sorting.field}
                    onValueChange={(value: any) =>
                      setSearchQuery((prev) => ({
                        ...prev,
                        sorting: { ...prev.sorting, field: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                      <SelectItem value="depth">Depth</SelectItem>
                      <SelectItem value="children">Children Count</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Order</label>
                  <Select
                    value={searchQuery.sorting.order}
                    onValueChange={(value: any) =>
                      setSearchQuery((prev) => ({
                        ...prev,
                        sorting: { ...prev.sorting, order: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" />
                  Clear Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save Search
                </Button>
              </div>
            </div>
          )}

          {/* Save Search Dialog */}
          {showSaveDialog && (
            <div className="space-y-3 p-4 border rounded-md bg-blue-50">
              <label className="text-sm font-medium">Save Search</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter search name..."
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveSearch()}
                />
                <Button
                  onClick={handleSaveSearch}
                  disabled={!saveSearchName.trim()}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Saved Searches
            </CardTitle>
            <CardDescription>
              Quick access to your frequently used searches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedSearches.map((savedSearch) => (
                <div
                  key={savedSearch.id}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => loadSavedSearch(savedSearch)}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{savedSearch.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {savedSearch.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {savedSearch.query.filters.nodeTypes.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {savedSearch.query.filters.nodeTypes.length} types
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      Load
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {searchResults.length} results found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="p-3 rounded-md border hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {result.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {result.path.join(" > ")}
                      </p>
                      {result.matches.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.matches.map((match, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {match}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
