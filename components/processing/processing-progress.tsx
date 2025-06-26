"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, RefreshCw, Trash2, Clock, FileText } from "lucide-react"
import type { ProcessingResult, ProcessingError } from "@/types/figma"

interface ProcessingProgressProps {
  isProcessing: boolean
  isLoading: boolean
  progress: number
  currentFile?: string
  processedFiles: ProcessingResult[]
  errors: ProcessingError[]
  onRetry: (fileId: string) => void
  onClear: () => void
}

export function ProcessingProgress({
  isProcessing,
  isLoading,
  progress,
  currentFile,
  processedFiles,
  errors,
  onRetry,
  onClear,
}: ProcessingProgressProps) {
  const totalFiles = processedFiles.length + errors.length
  const successCount = processedFiles.length
  const errorCount = errors.length
  const successRate = totalFiles > 0 ? (successCount / totalFiles) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isProcessing || isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            <span>Processing Status</span>
          </div>
          {totalFiles > 0 && (
            <Button variant="outline" size="sm" onClick={onClear}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Progress */}
        {(isProcessing || isLoading) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {currentFile ? `Processing: ${currentFile}` : "Processing..."}
              </span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Statistics */}
        {totalFiles > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-xs text-gray-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalFiles}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(successRate)}%</div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </div>
          </div>
        )}

        {/* Recent Results */}
        {processedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Recent Successes
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {processedFiles.slice(-5).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-2 bg-green-50 rounded text-sm">
                  <span className="truncate flex-1">{result.data.name}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {result.processingTime}ms
                    </Badge>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-600 flex items-center">
              <XCircle className="w-4 h-4 mr-1" />
              Failed Files
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {errors.map((error) => (
                <Alert key={error.id} variant="destructive">
                  <AlertDescription className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium truncate">{error.url}</div>
                      <div className="text-xs">{error.error}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => onRetry(error.id)}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
