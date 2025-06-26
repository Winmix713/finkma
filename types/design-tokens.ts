/**
 * Design token type definitions for the Design System Panel
 */

export interface DesignToken {
  /** Unique identifier for the token */
  id: string
  /** Human-readable name */
  name: string
  /** Token category */
  category: TokenCategory
  /** Token type within category */
  type: string
  /** Token value */
  value: TokenValue
  /** Description or usage notes */
  description?: string
  /** Figma node ID this token was extracted from */
  figmaNodeId?: string
  /** Token metadata */
  metadata: TokenMetadata
  /** Usage statistics */
  usage?: TokenUsage
  /** Validation status */
  validation: ValidationStatus
}

export type TokenCategory =
  | "color"
  | "typography"
  | "spacing"
  | "shadow"
  | "border-radius"
  | "border-width"
  | "opacity"
  | "z-index"
  | "animation"
  | "breakpoint"

export interface ColorToken extends DesignToken {
  category: "color"
  value: ColorValue
  accessibility: ColorAccessibility
}

export interface TypographyToken extends DesignToken {
  category: "typography"
  value: TypographyValue
  webFont?: WebFontInfo
}

export interface SpacingToken extends DesignToken {
  category: "spacing"
  value: SpacingValue
}

export interface ShadowToken extends DesignToken {
  category: "shadow"
  value: ShadowValue
}

export type TokenValue =
  | ColorValue
  | TypographyValue
  | SpacingValue
  | ShadowValue
  | BorderRadiusValue
  | OpacityValue
  | ZIndexValue

export interface ColorValue {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  alpha?: number
}

export interface TypographyValue {
  fontFamily: string
  fontSize: number
  fontWeight: number | string
  lineHeight: number | string
  letterSpacing?: number
  textTransform?: string
}

export interface SpacingValue {
  value: number
  unit: "px" | "rem" | "em" | "%"
}

export interface ShadowValue {
  offsetX: number
  offsetY: number
  blurRadius: number
  spreadRadius?: number
  color: ColorValue
  inset?: boolean
}

export interface BorderRadiusValue {
  value: number
  unit: "px" | "rem" | "em" | "%"
}

export interface OpacityValue {
  value: number // 0-1
}

export interface ZIndexValue {
  value: number
}

export interface TokenMetadata {
  /** When the token was created */
  createdAt: Date
  /** When the token was last modified */
  updatedAt: Date
  /** Who created the token */
  createdBy?: string
  /** Tags for organization */
  tags: string[]
  /** Custom properties */
  custom: Record<string, any>
}

export interface TokenUsage {
  /** Number of times used in designs */
  usageCount: number
  /** Components using this token */
  usedInComponents: string[]
  /** Last usage date */
  lastUsed?: Date
}

export interface ValidationStatus {
  /** Whether the token is valid */
  isValid: boolean
  /** Validation errors */
  errors: ValidationError[]
  /** Validation warnings */
  warnings: ValidationWarning[]
  /** Last validation date */
  lastValidated: Date
}

export interface ValidationError {
  code: string
  message: string
  severity: "error" | "warning" | "info"
  suggestion?: string
}

export interface ValidationWarning {
  code: string
  message: string
  suggestion?: string
}

export interface ColorAccessibility {
  /** WCAG contrast ratio */
  contrastRatio?: number
  /** WCAG compliance level */
  wcagLevel?: "A" | "AA" | "AAA"
  /** Color blindness simulation results */
  colorBlindness: ColorBlindnessInfo
}

export interface ColorBlindnessInfo {
  protanopia: string
  deuteranopia: string
  tritanopia: string
  achromatopsia: string
}

export interface WebFontInfo {
  /** Font family name */
  family: string
  /** Available weights */
  weights: number[]
  /** Available styles */
  styles: string[]
  /** Font loading strategy */
  loading: "swap" | "block" | "fallback" | "optional"
  /** Font display value */
  display: string
}

export interface TokenCollection {
  /** Collection identifier */
  id: string
  /** Collection name */
  name: string
  /** Collection description */
  description?: string
  /** Tokens in this collection */
  tokens: DesignToken[]
  /** Collection metadata */
  metadata: CollectionMetadata
}

export interface CollectionMetadata {
  /** Figma file key */
  figmaFileKey?: string
  /** Figma file name */
  figmaFileName?: string
  /** Extraction date */
  extractedAt: Date
  /** Version information */
  version: string
  /** Collection tags */
  tags: string[]
}

export interface TokenFilter {
  /** Search query */
  query?: string
  /** Filter by categories */
  categories?: TokenCategory[]
  /** Filter by tags */
  tags?: string[]
  /** Filter by validation status */
  validationStatus?: "valid" | "invalid" | "warning"
  /** Custom filters */
  custom?: Record<string, any>
}

export interface TokenSort {
  /** Sort field */
  field: "name" | "category" | "createdAt" | "updatedAt" | "usageCount"
  /** Sort direction */
  direction: "asc" | "desc"
}

export interface TokenSearchResult {
  /** Matching tokens */
  tokens: DesignToken[]
  /** Total count */
  totalCount: number
  /** Search metadata */
  metadata: SearchMetadata
}

export interface SearchMetadata {
  /** Search query */
  query: string
  /** Search duration in ms */
  duration: number
  /** Applied filters */
  filters: TokenFilter
  /** Applied sorting */
  sort: TokenSort
}
