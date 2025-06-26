"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast-system"
import { Upload, File, X, Loader2 } from "lucide-react"

interface FileUploadFormProps {
  onSubmit: (files: File[]) => Promise<void>
  disabled?: boolean
  acceptedTypes?: string[]
  maxFiles?: number
  maxSize?: number // in MB
}

interface UploadedFile {
  file: File
  id: string
  status: "pending" | "uploading" | "success" | "error"
  error?: string
}

export function FileUploadForm({
  onSubmit,
  disabled = false,
  acceptedTypes = [".fig", ".json"],
  maxFiles = 5,
  maxSize = 10,
}: FileUploadFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { success, error, warning } = useToast()

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    // Check file type
    const extension = "." + file.name.split(".").pop()?.toLowerCase()
    if (!acceptedTypes.includes(extension)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(", ")}`
    }

    return null
  }

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const newFiles: UploadedFile[] = []

      for (const file of fileArray) {
        // Check if we've reached max files
        if (uploadedFiles.length + newFiles.length >= maxFiles) {
          warning("Too Many Files", `Maximum ${maxFiles} files allowed`)
          break
        }

        // Validate file
        const validationError = validateFile(file)

        const uploadedFile: UploadedFile = {
          file,
          id: Math.random().toString(36).substr(2, 9),
          status: validationError ? "error" : "pending",
          error: validationError || undefined,
        }

        newFiles.push(uploadedFile)
      }

      setUploadedFiles((prev) => [...prev, ...newFiles])

      if (newFiles.some((f) => f.status === "error")) {
        error("Some Files Invalid", "Please check the file requirements")
      }
    },
    [uploadedFiles.length, maxFiles, maxSize, acceptedTypes, warning, error],
  )

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      addFiles(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      addFiles(files)
    }
    // Reset input
    e.target.value = ""
  }

  const handleSubmit = async () => {
    const validFiles = uploadedFiles.filter((f) => f.status === "pending")

    if (validFiles.length === 0) {
      error("No Valid Files", "Please add valid files to upload")
      return
    }

    setIsUploading(true)

    // Update status to uploading
    setUploadedFiles((prev) => prev.map((f) => (f.status === "pending" ? { ...f, status: "uploading" as const } : f)))

    try {
      await onSubmit(validFiles.map((f) => f.file))

      // Update status to success
      setUploadedFiles((prev) => prev.map((f) => (f.status === "uploading" ? { ...f, status: "success" as const } : f)))

      success("Files Uploaded", `Successfully uploaded ${validFiles.length} file(s)`)
    } catch (err) {
      // Update status to error
      setUploadedFiles((prev) =>
        prev.map((f) => (f.status === "uploading" ? { ...f, status: "error" as const, error: "Upload failed" } : f)),
      )

      const errorMessage = err instanceof Error ? err.message : "Upload failed"
      error("Upload Failed", errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const validFiles = uploadedFiles.filter((f) => f.status === "pending" || f.status === "success")
  const canSubmit = validFiles.length > 0 && !disabled && !isUploading

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          File Upload
        </CardTitle>
        <CardDescription>Upload Figma files or JSON exports for processing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Drop files here or click to browse</p>
            <p className="text-sm text-gray-600">
              Supported formats: {acceptedTypes.join(", ")} • Max {maxSize}MB per file
            </p>
          </div>

          <input
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={handleFileSelect}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              Uploaded Files ({uploadedFiles.length}/{maxFiles})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border
                    ${
                      uploadedFile.status === "success"
                        ? "bg-green-50 border-green-200"
                        : uploadedFile.status === "error"
                          ? "bg-red-50 border-red-200"
                          : uploadedFile.status === "uploading"
                            ? "bg-blue-50 border-blue-200"
                            : "bg-gray-50 border-gray-200"
                    }
                  `}
                >
                  <File className="h-4 w-4 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                    <p className="text-xs text-gray-600">{(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    {uploadedFile.error && <p className="text-xs text-red-600 mt-1">{uploadedFile.error}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    {uploadedFile.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadedFile.id)}
                      disabled={uploadedFile.status === "uploading"}
                      className="h-auto p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading {validFiles.length} file(s)...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {validFiles.length} File(s)
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500">
          <p className="font-medium mb-1">Supported file types:</p>
          <ul className="space-y-1">
            <li>• .fig - Native Figma files</li>
            <li>• .json - Figma API exports</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
