"use client"

/**
 * Custom hook for design token management with advanced features
 */

import { useState, useCallback, useEffect, useRef } from "react"
import type {
  DesignToken,
  TokenCollection,
  TokenFilter,
  TokenSort,
  TokenSearchResult,
  ValidationStatus,
} from "@/types/design-tokens"
import type { ExtractionOptions, ExtractionProgress } from "@/services/design-system-extractor"
import { DesignSystemExtractor } from "@/services/design-system-extractor"

export interface UseDesignTokensOptions {
  /** Initial token collection */
  initialCollection?: TokenCollection
  /** Auto-save interval in ms */
  autoSaveInterval?: number
  /** Maximum undo history size */
  maxHistorySize?: number
  /** Enable real-time validation */
  enableValidation?: boolean
}

export interface DesignTokensState {
  /** Current token collection */
  collection: TokenCollection | null
  /** Filtered and sorted tokens */
  displayTokens: DesignToken[]
  /** Current filter */
  filter: TokenFilter
  /** Current sort */
  sort: TokenSort
  /** Search results */
  searchResults: TokenSearchResult | null
  /** Loading states */
  loading: {
    extracting: boolean
    validating: boolean
    saving: boolean
  }
  /** Extraction progress */
  extractionProgress: ExtractionProgress | null
  /** Errors */
  errors: string[]
  /** Undo/redo history */
  history: {
    canUndo: boolean
    canRedo: boolean
    currentIndex: number
    entries: HistoryEntry[]
  }
  /** Selection state */
  selection: {
    selectedTokens: Set<string>
    lastSelected: string | null
  }
}

interface HistoryEntry {
  id: string
  timestamp: Date
  action: string
  collection: TokenCollection
}

export function useDesignTokens(options: UseDesignTokensOptions = {}) {
  const {
    initialCollection,
    autoSaveInterval = 30000, // 30 seconds
    maxHistorySize = 50,
    enableValidation = true,
  } = options

  const [state, setState] = useState<DesignTokensState>({
    collection: initialCollection || null,
    displayTokens: initialCollection?.tokens || [],
    filter: {},
    sort: { field: "name", direction: "asc" },
    searchResults: null,
    loading: {
      extracting: false,
      validating: false,
      saving: false,
    },
    extractionProgress: null,
    errors: [],
    history: {
      canUndo: false,
      canRedo: false,
      currentIndex: -1,
      entries: [],
    },
    selection: {
      selectedTokens: new Set(),
      lastSelected: null,
    },
  })

  const extractorRef = useRef<DesignSystemExtractor | null>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save functionality
  useEffect(() => {
    if (state.collection && autoSaveInterval > 0) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }

      autoSaveTimerRef.current = setTimeout(() => {
        saveToLocalStorage(state.collection!)
      }, autoSaveInterval)
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [state.collection, autoSaveInterval])

  // Real-time validation
  useEffect(() => {
    if (enableValidation && state.collection) {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current)
      }

      validationTimerRef.current = setTimeout(() => {
        validateTokens()
      }, 1000) // Debounce validation
    }

    return () => {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current)
      }
    }
  }, [state.collection, enableValidation])

  // Filter and sort tokens when collection, filter, or sort changes
  useEffect(() => {
    if (state.collection) {
      const filtered = filterTokens(state.collection.tokens, state.filter)
      const sorted = sortTokens(filtered, state.sort)

      setState((prev) => ({
        ...prev,
        displayTokens: sorted,
      }))
    }
  }, [state.collection, state.filter, state.sort])

  const extractTokens = useCallback(async (figmaData: any, extractionOptions: ExtractionOptions): Promise<void> => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, extracting: true },
      extractionProgress: null,
      errors: [],
    }))

    try {
      const extractor = new DesignSystemExtractor(figmaData, extractionOptions, (progress) => {
        setState((prev) => ({
          ...prev,
          extractionProgress: progress,
        }))
      })

      extractorRef.current = extractor
      const collection = await extractor.extractTokens()

      setState((prev) => ({
        ...prev,
        collection,
        loading: { ...prev.loading, extracting: false },
        extractionProgress: null,
      }))

      // Add to history
      addToHistory("extract", collection)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Extraction failed"
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, extracting: false },
        extractionProgress: null,
        errors: [...prev.errors, errorMessage],
      }))
    }
  }, [])

  const cancelExtraction = useCallback(() => {
    if (extractorRef.current) {
      extractorRef.current.abort()
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, extracting: false },
        extractionProgress: null,
      }))
    }
  }, [])

  const updateToken = useCallback(
    (tokenId: string, updates: Partial<DesignToken>) => {
      if (!state.collection) return

      const updatedTokens = state.collection.tokens.map((token) =>
        token.id === tokenId ? { ...token, ...updates, metadata: { ...token.metadata, updatedAt: new Date() } } : token,
      )

      const updatedCollection = {
        ...state.collection,
        tokens: updatedTokens,
      }

      setState((prev) => ({
        ...prev,
        collection: updatedCollection,
      }))

      addToHistory("update", updatedCollection)
    },
    [state.collection],
  )

  const deleteToken = useCallback(
    (tokenId: string) => {
      if (!state.collection) return

      const updatedTokens = state.collection.tokens.filter((token) => token.id !== tokenId)
      const updatedCollection = {
        ...state.collection,
        tokens: updatedTokens,
      }

      setState((prev) => ({
        ...prev,
        collection: updatedCollection,
        selection: {
          ...prev.selection,
          selectedTokens: new Set([...prev.selection.selectedTokens].filter((id) => id !== tokenId)),
          lastSelected: prev.selection.lastSelected === tokenId ? null : prev.selection.lastSelected,
        },
      }))

      addToHistory("delete", updatedCollection)
    },
    [state.collection],
  )

  const deleteSelectedTokens = useCallback(() => {
    if (!state.collection || state.selection.selectedTokens.size === 0) return

    const selectedIds = Array.from(state.selection.selectedTokens)
    const updatedTokens = state.collection.tokens.filter((token) => !selectedIds.includes(token.id))

    const updatedCollection = {
      ...state.collection,
      tokens: updatedTokens,
    }

    setState((prev) => ({
      ...prev,
      collection: updatedCollection,
      selection: {
        selectedTokens: new Set(),
        lastSelected: null,
      },
    }))

    addToHistory("bulk-delete", updatedCollection)
  }, [state.collection, state.selection.selectedTokens])

  const duplicateToken = useCallback(
    (tokenId: string) => {
      if (!state.collection) return

      const originalToken = state.collection.tokens.find((token) => token.id === tokenId)
      if (!originalToken) return

      const duplicatedToken: DesignToken = {
        ...originalToken,
        id: `${originalToken.id}-copy-${Date.now()}`,
        name: `${originalToken.name} Copy`,
        metadata: {
          ...originalToken.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      const updatedTokens = [...state.collection.tokens, duplicatedToken]
      const updatedCollection = {
        ...state.collection,
        tokens: updatedTokens,
      }

      setState((prev) => ({
        ...prev,
        collection: updatedCollection,
      }))

      addToHistory("duplicate", updatedCollection)
    },
    [state.collection],
  )

  const setFilter = useCallback((filter: TokenFilter) => {
    setState((prev) => ({
      ...prev,
      filter,
      searchResults: null,
    }))
  }, [])

  const setSort = useCallback((sort: TokenSort) => {
    setState((prev) => ({
      ...prev,
      sort,
    }))
  }, [])

  const searchTokens = useCallback(
    async (query: string): Promise<void> => {
      if (!state.collection || !query.trim()) {
        setState((prev) => ({
          ...prev,
          searchResults: null,
        }))
        return
      }

      const startTime = Date.now()
      const matchingTokens = state.collection.tokens.filter(
        (token) =>
          token.name.toLowerCase().includes(query.toLowerCase()) ||
          token.description?.toLowerCase().includes(query.toLowerCase()) ||
          token.metadata.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
      )

      const searchResults: TokenSearchResult = {
        tokens: matchingTokens,
        totalCount: matchingTokens.length,
        metadata: {
          query,
          duration: Date.now() - startTime,
          filters: state.filter,
          sort: state.sort,
        },
      }

      setState((prev) => ({
        ...prev,
        searchResults,
      }))
    },
    [state.collection, state.filter, state.sort],
  )

  const selectToken = useCallback((tokenId: string, multiSelect = false) => {
    setState((prev) => {
      const newSelection = new Set(prev.selection.selectedTokens)

      if (multiSelect) {
        if (newSelection.has(tokenId)) {
          newSelection.delete(tokenId)
        } else {
          newSelection.add(tokenId)
        }
      } else {
        newSelection.clear()
        newSelection.add(tokenId)
      }

      return {
        ...prev,
        selection: {
          selectedTokens: newSelection,
          lastSelected: tokenId,
        },
      }
    })
  }, [])

  const selectAllTokens = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selection: {
        selectedTokens: new Set(prev.displayTokens.map((token) => token.id)),
        lastSelected: prev.selection.lastSelected,
      },
    }))
  }, [state.displayTokens])

  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selection: {
        selectedTokens: new Set(),
        lastSelected: null,
      },
    }))
  }, [])

  const undo = useCallback(() => {
    if (!state.history.canUndo) return

    const newIndex = state.history.currentIndex - 1
    const entry = state.history.entries[newIndex]

    setState((prev) => ({
      ...prev,
      collection: entry.collection,
      history: {
        ...prev.history,
        currentIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
      },
    }))
  }, [state.history])

  const redo = useCallback(() => {
    if (!state.history.canRedo) return

    const newIndex = state.history.currentIndex + 1
    const entry = state.history.entries[newIndex]

    setState((prev) => ({
      ...prev,
      collection: entry.collection,
      history: {
        ...prev.history,
        currentIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < prev.history.entries.length - 1,
      },
    }))
  }, [state.history])

  const validateTokens = useCallback(async () => {
    if (!state.collection) return

    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, validating: true },
    }))

    try {
      // Simulate validation process
      await new Promise((resolve) => setTimeout(resolve, 500))

      const validatedTokens = state.collection.tokens.map((token) => ({
        ...token,
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          lastValidated: new Date(),
        } as ValidationStatus,
      }))

      const updatedCollection = {
        ...state.collection,
        tokens: validatedTokens,
      }

      setState((prev) => ({
        ...prev,
        collection: updatedCollection,
        loading: { ...prev.loading, validating: false },
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, validating: false },
        errors: [...prev.errors, "Validation failed"],
      }))
    }
  }, [state.collection])

  const addToHistory = useCallback(
    (action: string, collection: TokenCollection) => {
      setState((prev) => {
        const newEntry: HistoryEntry = {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          action,
          collection: JSON.parse(JSON.stringify(collection)), // Deep clone
        }

        const newEntries = [...prev.history.entries.slice(0, prev.history.currentIndex + 1), newEntry].slice(
          -maxHistorySize,
        )

        const newIndex = newEntries.length - 1

        return {
          ...prev,
          history: {
            entries: newEntries,
            currentIndex: newIndex,
            canUndo: newIndex > 0,
            canRedo: false,
          },
        }
      })
    },
    [maxHistorySize],
  )

  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: [],
    }))
  }, [])

  // Utility functions
  const filterTokens = (tokens: DesignToken[], filter: TokenFilter): DesignToken[] => {
    return tokens.filter((token) => {
      // Query filter
      if (filter.query) {
        const query = filter.query.toLowerCase()
        const matchesQuery =
          token.name.toLowerCase().includes(query) ||
          token.description?.toLowerCase().includes(query) ||
          token.metadata.tags.some((tag) => tag.toLowerCase().includes(query))

        if (!matchesQuery) return false
      }

      // Category filter
      if (filter.categories && filter.categories.length > 0) {
        if (!filter.categories.includes(token.category)) return false
      }

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some((tag) => token.metadata.tags.includes(tag))
        if (!hasMatchingTag) return false
      }

      // Validation status filter
      if (filter.validationStatus) {
        switch (filter.validationStatus) {
          case "valid":
            if (!token.validation.isValid) return false
            break
          case "invalid":
            if (token.validation.isValid || token.validation.errors.length === 0) return false
            break
          case "warning":
            if (token.validation.warnings.length === 0) return false
            break
        }
      }

      return true
    })
  }

  const sortTokens = (tokens: DesignToken[], sort: TokenSort): DesignToken[] => {
    return [...tokens].sort((a, b) => {
      let comparison = 0

      switch (sort.field) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "category":
          comparison = a.category.localeCompare(b.category)
          break
        case "createdAt":
          comparison = a.metadata.createdAt.getTime() - b.metadata.createdAt.getTime()
          break
        case "updatedAt":
          comparison = a.metadata.updatedAt.getTime() - b.metadata.updatedAt.getTime()
          break
        case "usageCount":
          comparison = (a.usage?.usageCount || 0) - (b.usage?.usageCount || 0)
          break
      }

      return sort.direction === "desc" ? -comparison : comparison
    })
  }

  const saveToLocalStorage = (collection: TokenCollection) => {
    try {
      localStorage.setItem("design-tokens", JSON.stringify(collection))
    } catch (error) {
      console.warn("Failed to save to localStorage:", error)
    }
  }

  return {
    // State
    ...state,

    // Actions
    extractTokens,
    cancelExtraction,
    updateToken,
    deleteToken,
    deleteSelectedTokens,
    duplicateToken,
    setFilter,
    setSort,
    searchTokens,
    selectToken,
    selectAllTokens,
    clearSelection,
    undo,
    redo,
    validateTokens,
    clearErrors,

    // Computed values
    hasSelection: state.selection.selectedTokens.size > 0,
    selectedCount: state.selection.selectedTokens.size,
    totalTokens: state.collection?.tokens.length || 0,
    filteredCount: state.displayTokens.length,
  }
}
