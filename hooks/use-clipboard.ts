"use client"

/**
 * Custom hook for clipboard operations with fallback support
 */

import { useState, useCallback, useRef } from "react"
import type { ClipboardState, CodePreviewError } from "@/types/code-preview"
import { ERROR_MESSAGES, SUCCESS_TIMEOUT } from "@/constants/code-preview"

export function useClipboard() {
  const [state, setState] = useState<ClipboardState>({
    isLoading: false,
    success: null,
    error: null,
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const copyToClipboard = useCallback(
    async (text: string, tabId: string): Promise<void> => {
      if (!text.trim()) {
        const error: CodePreviewError = new Error("No content to copy") as CodePreviewError
        error.type = "clipboard"
        throw error
      }

      setState({ isLoading: true, success: null, error: null })

      try {
        // Modern Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text)
        } else {
          // Fallback for older browsers
          await fallbackCopyToClipboard(text)
        }

        setState({ isLoading: false, success: tabId, error: null })

        // Clear success state after timeout
        clearTimeout()
        timeoutRef.current = window.setTimeout(() => {
          setState((prev) => ({ ...prev, success: null }))
        }, SUCCESS_TIMEOUT)
      } catch (error) {
        const clipboardError: CodePreviewError = new Error(
          error instanceof Error ? error.message : ERROR_MESSAGES.CLIPBOARD_FAILED,
        ) as CodePreviewError
        clipboardError.type = "clipboard"
        clipboardError.context = { tabId, textLength: text.length }

        setState({ isLoading: false, success: null, error: clipboardError.message })
        throw clipboardError
      }
    },
    [clearTimeout],
  )

  const fallbackCopyToClipboard = useCallback(async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      textArea.setAttribute("readonly", "")
      textArea.setAttribute("aria-hidden", "true")

      document.body.appendChild(textArea)

      try {
        textArea.focus()
        textArea.select()
        textArea.setSelectionRange(0, text.length)

        const successful = document.execCommand("copy")
        document.body.removeChild(textArea)

        if (successful) {
          resolve()
        } else {
          reject(new Error(ERROR_MESSAGES.CLIPBOARD_FAILED))
        }
      } catch (error) {
        document.body.removeChild(textArea)
        reject(error)
      }
    })
  }, [])

  const clearState = useCallback(() => {
    clearTimeout()
    setState({ isLoading: false, success: null, error: null })
  }, [clearTimeout])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    clearTimeout()
  }, [clearTimeout])

  return {
    ...state,
    copyToClipboard,
    clearState,
    cleanup,
  }
}
