"use client"

/**
 * Custom hook for file download functionality
 */

import { useState, useCallback, useRef } from "react"
import type { DownloadState, CodePreviewError } from "@/types/code-preview"
import { ERROR_MESSAGES, SUCCESS_TIMEOUT } from "@/constants/code-preview"

export function useFileDownload() {
  const [state, setState] = useState<DownloadState>({
    isLoading: false,
    success: false,
    error: null,
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const urlsRef = useRef<string[]>([])

  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const cleanupUrls = useCallback(() => {
    urlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url)
      } catch (error) {
        console.warn("Failed to revoke object URL:", error)
      }
    })
    urlsRef.current = []
  }, [])

  const downloadFile = useCallback(
    async (content: string, filename: string, mimeType = "text/plain"): Promise<void> => {
      if (!content.trim()) {
        const error: CodePreviewError = new Error("No content to download") as CodePreviewError
        error.type = "download"
        throw error
      }

      setState({ isLoading: true, success: false, error: null })

      try {
        // Create blob with proper MIME type
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
        const url = URL.createObjectURL(blob)

        // Track URL for cleanup
        urlsRef.current.push(url)

        // Create download link
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        link.style.display = "none"
        link.setAttribute("aria-hidden", "true")

        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setState({ isLoading: false, success: true, error: null })

        // Clear success state after timeout
        clearTimeout()
        timeoutRef.current = window.setTimeout(() => {
          setState((prev) => ({ ...prev, success: false }))
        }, SUCCESS_TIMEOUT)

        // Clean up URL after a short delay
        setTimeout(() => {
          URL.revokeObjectURL(url)
          urlsRef.current = urlsRef.current.filter((u) => u !== url)
        }, 100)
      } catch (error) {
        const downloadError: CodePreviewError = new Error(
          error instanceof Error ? error.message : ERROR_MESSAGES.DOWNLOAD_FAILED,
        ) as CodePreviewError
        downloadError.type = "download"
        downloadError.context = { filename, contentLength: content.length, mimeType }

        setState({ isLoading: false, success: false, error: downloadError.message })
        throw downloadError
      }
    },
    [clearTimeout],
  )

  const getMimeType = useCallback((extension: string): string => {
    const mimeTypes: Record<string, string> = {
      ".js": "application/javascript",
      ".jsx": "application/javascript",
      ".ts": "application/typescript",
      ".tsx": "application/typescript",
      ".css": "text/css",
      ".html": "text/html",
      ".json": "application/json",
      ".md": "text/markdown",
    }

    return mimeTypes[extension.toLowerCase()] || "text/plain"
  }, [])

  const downloadWithExtension = useCallback(
    async (content: string, filename: string, extension: string): Promise<void> => {
      const fullFilename = filename.endsWith(extension) ? filename : `${filename}${extension}`
      const mimeType = getMimeType(extension)

      return downloadFile(content, fullFilename, mimeType)
    },
    [downloadFile, getMimeType],
  )

  const clearState = useCallback(() => {
    clearTimeout()
    setState({ isLoading: false, success: false, error: null })
  }, [clearTimeout])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    clearTimeout()
    cleanupUrls()
  }, [clearTimeout, cleanupUrls])

  return {
    ...state,
    downloadFile,
    downloadWithExtension,
    clearState,
    cleanup,
  }
}
