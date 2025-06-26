"use client"

/**
 * Custom hook for theme detection and management
 */

import { useState, useEffect, useCallback } from "react"
import type { ThemeState, SyntaxTheme } from "@/types/code-preview"

export function useTheme(initialTheme: "light" | "dark" | "auto" = "auto") {
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    const systemTheme = getSystemTheme()
    return {
      theme: initialTheme === "auto" ? systemTheme : initialTheme,
      systemTheme,
      userPreference: initialTheme,
    }
  })

  const updateSystemTheme = useCallback(() => {
    const systemTheme = getSystemTheme()
    setThemeState((prev) => ({
      ...prev,
      systemTheme,
      theme: prev.userPreference === "auto" ? systemTheme : prev.theme,
    }))
  }, [])

  const setUserTheme = useCallback((preference: "light" | "dark" | "auto") => {
    const systemTheme = getSystemTheme()
    setThemeState((prev) => ({
      ...prev,
      userPreference: preference,
      theme: preference === "auto" ? systemTheme : preference,
    }))
  }, [])

  const getSyntaxTheme = useCallback((): SyntaxTheme => {
    const isHighContrast = window.matchMedia("(prefers-contrast: high)").matches

    if (isHighContrast) {
      return "high-contrast"
    }

    return themeState.theme
  }, [themeState.theme])

  const getReducedMotion = useCallback((): boolean => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      updateSystemTheme()
    }

    // Add event listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [updateSystemTheme])

  return {
    ...themeState,
    setUserTheme,
    getSyntaxTheme,
    getReducedMotion,
  }
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"

  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  } catch (error) {
    console.warn("Failed to detect system theme:", error)
    return "light"
  }
}
