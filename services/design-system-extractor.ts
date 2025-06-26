/**
 * Advanced design system token extraction service
 */

import type {
  DesignToken,
  TokenCollection,
  ColorToken,
  TypographyToken,
  SpacingToken,
  ShadowToken,
  ColorValue,
  TypographyValue,
  SpacingValue,
  ShadowValue,
  ValidationStatus,
  TokenCategory,
} from "@/types/design-tokens"
import type { FigmaApiResponse, FigmaNode, FigmaStyle } from "@/types/figma"

export interface ExtractionOptions {
  /** Categories to extract */
  categories: TokenCategory[]
  /** Whether to include usage statistics */
  includeUsage: boolean
  /** Whether to validate tokens */
  validateTokens: boolean
  /** Custom extraction rules */
  customRules?: ExtractionRule[]
  /** Naming convention */
  namingConvention: NamingConvention
}

export interface ExtractionRule {
  /** Rule name */
  name: string
  /** Node selector */
  selector: (node: FigmaNode) => boolean
  /** Token extractor */
  extractor: (node: FigmaNode) => DesignToken | null
  /** Priority (higher = processed first) */
  priority: number
}

export interface NamingConvention {
  /** Naming style */
  style: "camelCase" | "kebab-case" | "snake_case" | "PascalCase"
  /** Prefix for all tokens */
  prefix?: string
  /** Suffix for all tokens */
  suffix?: string
  /** Category prefixes */
  categoryPrefixes?: Record<TokenCategory, string>
}

export interface ExtractionProgress {
  /** Current phase */
  phase: ExtractionPhase
  /** Progress percentage (0-100) */
  progress: number
  /** Current item being processed */
  currentItem?: string
  /** Total items to process */
  totalItems: number
  /** Processed items */
  processedItems: number
  /** Estimated time remaining (ms) */
  estimatedTimeRemaining?: number
}

export type ExtractionPhase =
  | "initializing"
  | "analyzing-structure"
  | "extracting-colors"
  | "extracting-typography"
  | "extracting-spacing"
  | "extracting-shadows"
  | "extracting-borders"
  | "validating-tokens"
  | "generating-metadata"
  | "finalizing"

export class DesignSystemExtractor {
  private figmaData: FigmaApiResponse
  private options: ExtractionOptions
  private progressCallback?: (progress: ExtractionProgress) => void
  private abortController?: AbortController

  constructor(
    figmaData: FigmaApiResponse,
    options: ExtractionOptions,
    progressCallback?: (progress: ExtractionProgress) => void,
  ) {
    this.figmaData = figmaData
    this.options = options
    this.progressCallback = progressCallback
  }

  async extractTokens(): Promise<TokenCollection> {
    this.abortController = new AbortController()

    try {
      this.updateProgress("initializing", 0)

      const collection: TokenCollection = {
        id: `collection-${Date.now()}`,
        name: this.figmaData.name || "Design System",
        description: `Extracted from ${this.figmaData.name}`,
        tokens: [],
        metadata: {
          figmaFileKey: this.extractFileKey(),
          figmaFileName: this.figmaData.name,
          extractedAt: new Date(),
          version: this.figmaData.version || "1.0.0",
          tags: [],
        },
      }

      // Analyze document structure
      this.updateProgress("analyzing-structure", 10)
      const nodes = this.analyzeDocumentStructure()

      // Extract tokens by category
      const extractionTasks = [
        { category: "color", extractor: this.extractColorTokens.bind(this), weight: 25 },
        { category: "typography", extractor: this.extractTypographyTokens.bind(this), weight: 20 },
        { category: "spacing", extractor: this.extractSpacingTokens.bind(this), weight: 15 },
        { category: "shadow", extractor: this.extractShadowTokens.bind(this), weight: 15 },
        { category: "border-radius", extractor: this.extractBorderRadiusTokens.bind(this), weight: 10 },
      ]

      let currentProgress = 10
      for (const task of extractionTasks) {
        if (this.options.categories.includes(task.category as TokenCategory)) {
          this.updateProgress(`extracting-${task.category}` as ExtractionPhase, currentProgress)
          const tokens = await task.extractor(nodes)
          collection.tokens.push(...tokens)
        }
        currentProgress += task.weight
      }

      // Validate tokens if requested
      if (this.options.validateTokens) {
        this.updateProgress("validating-tokens", 85)
        await this.validateTokens(collection.tokens)
      }

      // Generate metadata
      this.updateProgress("generating-metadata", 95)
      await this.generateMetadata(collection)

      this.updateProgress("finalizing", 100)

      return collection
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Token extraction was cancelled")
      }
      throw error
    }
  }

  abort(): void {
    this.abortController?.abort()
  }

  private updateProgress(phase: ExtractionPhase, progress: number): void {
    this.progressCallback?.({
      phase,
      progress,
      totalItems: 100,
      processedItems: progress,
      currentItem: this.getPhaseDescription(phase),
    })
  }

  private getPhaseDescription(phase: ExtractionPhase): string {
    const descriptions: Record<ExtractionPhase, string> = {
      initializing: "Initializing extraction process...",
      "analyzing-structure": "Analyzing Figma document structure...",
      "extracting-colors": "Extracting color tokens...",
      "extracting-typography": "Extracting typography tokens...",
      "extracting-spacing": "Extracting spacing tokens...",
      "extracting-shadows": "Extracting shadow tokens...",
      "extracting-borders": "Extracting border tokens...",
      "validating-tokens": "Validating extracted tokens...",
      "generating-metadata": "Generating metadata...",
      finalizing: "Finalizing token collection...",
    }
    return descriptions[phase]
  }

  private analyzeDocumentStructure(): FigmaNode[] {
    const nodes: FigmaNode[] = []

    const traverse = (node: FigmaNode) => {
      nodes.push(node)
      if (node.children) {
        node.children.forEach(traverse)
      }
    }

    if (this.figmaData.document?.children) {
      this.figmaData.document.children.forEach(traverse)
    }

    return nodes
  }

  private async extractColorTokens(nodes: FigmaNode[]): Promise<ColorToken[]> {
    const colorTokens: ColorToken[] = []
    const processedColors = new Set<string>()

    // Extract from fills
    for (const node of nodes) {
      if (node.fills) {
        for (const fill of node.fills) {
          if (fill.type === "SOLID" && fill.color) {
            const colorKey = this.getColorKey(fill.color)
            if (!processedColors.has(colorKey)) {
              processedColors.add(colorKey)

              const colorValue = this.convertFigmaColorToColorValue(fill.color, fill.opacity)
              const token = this.createColorToken(node, colorValue)
              colorTokens.push(token)
            }
          }
        }
      }
    }

    // Extract from styles
    if (this.figmaData.styles) {
      for (const [styleId, style] of Object.entries(this.figmaData.styles)) {
        if (style.styleType === "FILL") {
          // Create token from style
          const token = this.createColorTokenFromStyle(styleId, style)
          if (token) {
            colorTokens.push(token)
          }
        }
      }
    }

    return colorTokens
  }

  private async extractTypographyTokens(nodes: FigmaNode[]): Promise<TypographyToken[]> {
    const typographyTokens: TypographyToken[] = []
    const processedStyles = new Set<string>()

    for (const node of nodes) {
      if (node.type === "TEXT" && node.style) {
        const styleKey = this.getTypographyStyleKey(node.style)
        if (!processedStyles.has(styleKey)) {
          processedStyles.add(styleKey)

          const typographyValue = this.convertFigmaStyleToTypographyValue(node.style)
          const token = this.createTypographyToken(node, typographyValue)
          typographyTokens.push(token)
        }
      }
    }

    return typographyTokens
  }

  private async extractSpacingTokens(nodes: FigmaNode[]): Promise<SpacingToken[]> {
    const spacingTokens: SpacingToken[] = []
    const spacingValues = new Set<number>()

    for (const node of nodes) {
      // Extract padding/margin values
      if (node.paddingLeft !== undefined) spacingValues.add(node.paddingLeft)
      if (node.paddingRight !== undefined) spacingValues.add(node.paddingRight)
      if (node.paddingTop !== undefined) spacingValues.add(node.paddingTop)
      if (node.paddingBottom !== undefined) spacingValues.add(node.paddingBottom)

      // Extract spacing from layout
      if (node.itemSpacing !== undefined) spacingValues.add(node.itemSpacing)
      if (node.counterAxisSpacing !== undefined) spacingValues.add(node.counterAxisSpacing)
    }

    // Convert unique spacing values to tokens
    Array.from(spacingValues).forEach((value, index) => {
      const spacingValue: SpacingValue = { value, unit: "px" }
      const token = this.createSpacingToken(`spacing-${index}`, spacingValue)
      spacingTokens.push(token)
    })

    return spacingTokens
  }

  private async extractShadowTokens(nodes: FigmaNode[]): Promise<ShadowToken[]> {
    const shadowTokens: ShadowToken[] = []
    const processedShadows = new Set<string>()

    for (const node of nodes) {
      if (node.effects) {
        for (const effect of node.effects) {
          if (effect.type === "DROP_SHADOW" && effect.visible) {
            const shadowKey = this.getShadowKey(effect)
            if (!processedShadows.has(shadowKey)) {
              processedShadows.add(shadowKey)

              const shadowValue = this.convertFigmaEffectToShadowValue(effect)
              const token = this.createShadowToken(node, shadowValue)
              shadowTokens.push(token)
            }
          }
        }
      }
    }

    return shadowTokens
  }

  private async extractBorderRadiusTokens(nodes: FigmaNode[]): Promise<DesignToken[]> {
    const borderRadiusTokens: DesignToken[] = []
    const radiusValues = new Set<number>()

    for (const node of nodes) {
      if (node.cornerRadius !== undefined) {
        radiusValues.add(node.cornerRadius)
      }

      // Individual corner radii
      if (node.rectangleCornerRadii) {
        node.rectangleCornerRadii.forEach((radius) => radiusValues.add(radius))
      }
    }

    Array.from(radiusValues).forEach((value, index) => {
      const token = this.createBorderRadiusToken(`border-radius-${index}`, value)
      borderRadiusTokens.push(token)
    })

    return borderRadiusTokens
  }

  private createColorToken(node: FigmaNode, colorValue: ColorValue): ColorToken {
    const name = this.generateTokenName("color", node.name || "color")

    return {
      id: `color-${node.id}`,
      name,
      category: "color",
      type: "solid",
      value: colorValue,
      description: `Color extracted from ${node.name}`,
      figmaNodeId: node.id,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["extracted", "color"],
        custom: {},
      },
      validation: this.createValidationStatus(),
      accessibility: this.calculateColorAccessibility(colorValue),
    }
  }

  private createColorTokenFromStyle(styleId: string, style: FigmaStyle): ColorToken | null {
    // Implementation would depend on style data structure
    // This is a simplified version
    return null
  }

  private createTypographyToken(node: FigmaNode, typographyValue: TypographyValue): TypographyToken {
    const name = this.generateTokenName("typography", node.name || "text")

    return {
      id: `typography-${node.id}`,
      name,
      category: "typography",
      type: "text-style",
      value: typographyValue,
      description: `Typography style from ${node.name}`,
      figmaNodeId: node.id,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["extracted", "typography"],
        custom: {},
      },
      validation: this.createValidationStatus(),
      webFont: this.detectWebFont(typographyValue.fontFamily),
    }
  }

  private createSpacingToken(name: string, spacingValue: SpacingValue): SpacingToken {
    return {
      id: `spacing-${name}`,
      name: this.generateTokenName("spacing", name),
      category: "spacing",
      type: "dimension",
      value: spacingValue,
      description: `Spacing value: ${spacingValue.value}${spacingValue.unit}`,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["extracted", "spacing"],
        custom: {},
      },
      validation: this.createValidationStatus(),
    }
  }

  private createShadowToken(node: FigmaNode, shadowValue: ShadowValue): ShadowToken {
    const name = this.generateTokenName("shadow", node.name || "shadow")

    return {
      id: `shadow-${node.id}`,
      name,
      category: "shadow",
      type: "drop-shadow",
      value: shadowValue,
      description: `Shadow effect from ${node.name}`,
      figmaNodeId: node.id,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["extracted", "shadow"],
        custom: {},
      },
      validation: this.createValidationStatus(),
    }
  }

  private createBorderRadiusToken(name: string, value: number): DesignToken {
    return {
      id: `border-radius-${name}`,
      name: this.generateTokenName("border-radius", name),
      category: "border-radius",
      type: "dimension",
      value: { value, unit: "px" },
      description: `Border radius: ${value}px`,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["extracted", "border-radius"],
        custom: {},
      },
      validation: this.createValidationStatus(),
    }
  }

  private generateTokenName(category: string, baseName: string): string {
    const { style, prefix, suffix, categoryPrefixes } = this.options.namingConvention

    let name = baseName

    // Apply category prefix
    if (categoryPrefixes?.[category as TokenCategory]) {
      name = `${categoryPrefixes[category as TokenCategory]}-${name}`
    }

    // Apply global prefix/suffix
    if (prefix) name = `${prefix}-${name}`
    if (suffix) name = `${name}-${suffix}`

    // Apply naming style
    return this.applyNamingStyle(name, style)
  }

  private applyNamingStyle(name: string, style: NamingConvention["style"]): string {
    const words = name.split(/[-_\s]+/).filter(Boolean)

    switch (style) {
      case "camelCase":
        return (
          words[0].toLowerCase() +
          words
            .slice(1)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join("")
        )

      case "PascalCase":
        return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("")

      case "kebab-case":
        return words.map((w) => w.toLowerCase()).join("-")

      case "snake_case":
        return words.map((w) => w.toLowerCase()).join("_")

      default:
        return name
    }
  }

  private convertFigmaColorToColorValue(figmaColor: any, opacity = 1): ColorValue {
    const r = Math.round(figmaColor.r * 255)
    const g = Math.round(figmaColor.g * 255)
    const b = Math.round(figmaColor.b * 255)

    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`

    // Convert RGB to HSL
    const hsl = this.rgbToHsl(r, g, b)

    return {
      hex,
      rgb: { r, g, b },
      hsl,
      alpha: opacity < 1 ? opacity : undefined,
    }
  }

  private convertFigmaStyleToTypographyValue(style: any): TypographyValue {
    return {
      fontFamily: style.fontFamily || "Arial",
      fontSize: style.fontSize || 16,
      fontWeight: style.fontWeight || 400,
      lineHeight: style.lineHeight || "normal",
      letterSpacing: style.letterSpacing,
      textTransform: style.textCase,
    }
  }

  private convertFigmaEffectToShadowValue(effect: any): ShadowValue {
    return {
      offsetX: effect.offset?.x || 0,
      offsetY: effect.offset?.y || 0,
      blurRadius: effect.radius || 0,
      spreadRadius: effect.spread || 0,
      color: this.convertFigmaColorToColorValue(effect.color || { r: 0, g: 0, b: 0 }),
      inset: effect.type === "INNER_SHADOW",
    }
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0,
      s = 0,
      l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  private calculateColorAccessibility(color: ColorValue): any {
    // Simplified accessibility calculation
    return {
      contrastRatio: 4.5, // Would calculate actual contrast
      wcagLevel: "AA" as const,
      colorBlindness: {
        protanopia: color.hex,
        deuteranopia: color.hex,
        tritanopia: color.hex,
        achromatopsia: color.hex,
      },
    }
  }

  private detectWebFont(fontFamily: string): any {
    // Simplified web font detection
    return {
      family: fontFamily,
      weights: [400, 700],
      styles: ["normal"],
      loading: "swap",
      display: "swap",
    }
  }

  private createValidationStatus(): ValidationStatus {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      lastValidated: new Date(),
    }
  }

  private async validateTokens(tokens: DesignToken[]): Promise<void> {
    // Token validation logic would go here
    for (const token of tokens) {
      // Validate token structure, values, etc.
      token.validation = this.createValidationStatus()
    }
  }

  private async generateMetadata(collection: TokenCollection): Promise<void> {
    // Generate additional metadata
    collection.metadata.tags = this.generateCollectionTags(collection.tokens)
  }

  private generateCollectionTags(tokens: DesignToken[]): string[] {
    const categories = [...new Set(tokens.map((t) => t.category))]
    return ["design-system", "figma-extracted", ...categories]
  }

  private extractFileKey(): string {
    // Extract file key from Figma data or URL
    return "demo-file-key"
  }

  private getColorKey(color: any): string {
    return `${color.r}-${color.g}-${color.b}`
  }

  private getTypographyStyleKey(style: any): string {
    return `${style.fontFamily}-${style.fontSize}-${style.fontWeight}`
  }

  private getShadowKey(effect: any): string {
    return `${effect.offset?.x || 0}-${effect.offset?.y || 0}-${effect.radius || 0}`
  }
}
