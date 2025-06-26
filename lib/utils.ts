import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ValidationResult } from "@/types/figma"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function copyToClipboard(text: string): Promise<void> {
  try {
    // Modern Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return
    }

    // Fallback for older browsers
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "fixed"
    textArea.style.left = "-999999px"
    textArea.style.top = "-999999px"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand("copy")
    document.body.removeChild(textArea)

    if (!successful) {
      throw new Error("Failed to copy text")
    }
  } catch (error) {
    console.error("Copy to clipboard failed:", error)
    throw new Error("Failed to copy to clipboard")
  }
}

export function downloadFile(content: string, filename: string): void {
  try {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.style.display = "none"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100)
  } catch (error) {
    console.error("Download failed:", error)
    throw new Error("Failed to download file")
  }
}

export function validateJSX(code: string): ValidationResult {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] }

  if (!code.trim()) {
    return result
  }

  // Basic JSX validation
  const openTags = code.match(/<[^/][^>]*>/g) || []
  const closeTags = code.match(/<\/[^>]*>/g) || []

  // Check for unmatched tags (simplified)
  if (openTags.length !== closeTags.length) {
    result.isValid = false
    result.errors.push({
      message: "Unmatched JSX tags detected",
      severity: "error",
    })
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    { pattern: /dangerouslySetInnerHTML/g, message: "dangerouslySetInnerHTML detected - potential XSS risk" },
    { pattern: /eval\s*\(/g, message: "eval() usage detected - security risk" },
    { pattern: /Function\s*\(/g, message: "Function constructor detected - security risk" },
    { pattern: /javascript:/g, message: "javascript: protocol detected - security risk" },
    { pattern: /<script/gi, message: "Script tag detected - potential security risk" },
  ]

  dangerousPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(code)) {
      result.warnings.push({
        message,
        severity: "warning",
      })
    }
  })

  // Check for React best practices
  if (code.includes("useState") && !code.includes("import")) {
    result.warnings.push({
      message: "useState used but React import not found",
      severity: "warning",
    })
  }

  return result
}

export function validateCSS(code: string): ValidationResult {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] }

  if (!code.trim()) {
    return result
  }

  // Basic CSS validation
  const openBraces = (code.match(/{/g) || []).length
  const closeBraces = (code.match(/}/g) || []).length

  if (openBraces !== closeBraces) {
    result.isValid = false
    result.errors.push({
      message: "Unmatched CSS braces",
      severity: "error",
    })
  }

  // Check for common CSS issues
  if (code.includes("!important")) {
    result.warnings.push({
      message: "!important usage detected - consider refactoring for better specificity",
      severity: "warning",
    })
  }

  // Check for vendor prefixes without standard property
  const vendorPrefixes = ["-webkit-", "-moz-", "-ms-", "-o-"]
  vendorPrefixes.forEach((prefix) => {
    const prefixedProps = code.match(new RegExp(`${prefix}[a-z-]+:`, "g"))
    if (prefixedProps) {
      result.warnings.push({
        message: `Vendor prefix ${prefix} detected - ensure standard property is also included`,
        severity: "info",
      })
    }
  })

  return result
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[^a-z0-9.-]/gi, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "")
}

export function getFileExtension(framework: string, typescript: boolean): string {
  switch (framework) {
    case "react":
      return typescript ? ".tsx" : ".jsx"
    case "vue":
      return ".vue"
    case "html":
      return ".html"
    default:
      return ".txt"
  }
}
