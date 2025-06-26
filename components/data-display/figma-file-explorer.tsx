"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Search,
  FileText,
  ImageIcon,
  Layers,
  Clock,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import type { ProcessingResult } from "@/types/figma";

interface FigmaFileExplorerProps {
  results: ProcessingResult[];
  selectedFiles: string[];
  onSelectFiles: (fileIds: string[]) => void;
  onRetryFile: (fileId: string) => void;
}

export function FigmaFileExplorer({
  results,
  selectedFiles,
  onSelectFiles,
  onRetryFile,
}: FigmaFileExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("name");

  const filteredResults = results.filter((result) =>
    result.data.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.data.name.localeCompare(b.data.name);
      case "date":
        return (
          new Date(b.data.lastModified).getTime() -
          new Date(a.data.lastModified).getTime()
        );
      case "size":
        return (
          Object.keys(b.data.components).length -
          Object.keys(a.data.components).length
        );
      default:
        return 0;
    }
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectFiles(sortedResults.map((r) => r.id));
    } else {
      onSelectFiles([]);
    }
  };

  const handleSelectFile = (fileId: string, checked: boolean) => {
    if (checked) {
      onSelectFiles([...selectedFiles, fileId]);
    } else {
      onSelectFiles(selectedFiles.filter((id) => id !== fileId));
    }
  };

  const getNodeCount = (result: ProcessingResult) => {
    const countNodes = (node: any): number => {
      let count = 1;
      if (node.children) {
        count += node.children.reduce(
          (sum: number, child: any) => sum + countNodes(child),
          0,
        );
      }
      return count;
    };
    return countNodes(result.data.document);
  };

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex items-center justify-between space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "name" | "date" | "size")
            }
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
            <option value="size">Sort by Size</option>
          </select>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={
                selectedFiles.length === sortedResults.length &&
                sortedResults.length > 0
              }
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm">
              Select All ({selectedFiles.length})
            </label>
          </div>
        </div>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedResults.map((result) => (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedFiles.includes(result.id)}
                    onCheckedChange={(checked) =>
                      handleSelectFile(result.id, checked as boolean)
                    }
                  />
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(result.url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle
                className="text-base truncate"
                title={result.data.name}
              >
                {result.data.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Thumbnail */}
              {result.data.thumbnailUrl && (
                <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                  <img
                    src={result.data.thumbnailUrl || "/placeholder.svg"}
                    alt={result.data.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <Layers className="w-3 h-3 text-gray-500" />
                  <span>{getNodeCount(result)} nodes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ImageIcon className="w-3 h-3 text-gray-500" />
                  <span>
                    {Object.keys(result.data.components).length} components
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last Modified</span>
                  <span>
                    {new Date(result.data.lastModified).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Processing Time</span>
                  <span>{result.processingTime}ms</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Version</span>
                  <span>{result.data.version}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Badge variant="secondary" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {result.timestamp.toLocaleTimeString()}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRetryFile(result.id)}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sortedResults.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No files found" : "No files processed"}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? `No files match "${searchTerm}"`
                : "Process some Figma files to see them here"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
