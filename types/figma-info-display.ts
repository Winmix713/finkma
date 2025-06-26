/**
 * Comprehensive types for Figma Information Display System
 */

export interface FigmaFileAnalysis {
  fileInfo: {
    id: string
    name: string
    lastModified: string
    version: string
    thumbnailUrl: string
    role: string
    editorType: string
    pages: number
    components: number
    styles: number
  }
  statistics: {
    totalNodes: number
    totalComponents: number
    totalStyles: number
    nodesByType: Record<string, number>
    componentsByType: Record<string, number>
    stylesByType: Record<string, number>
    layers: number
    instances: number
    colors: number
    fonts: number
  }
  nodeTree: {
    root: FigmaNode
    flatMap: Map<string, FigmaNode>
    depth: number
    maxChildren: number
  }
  components: Array<{
    id: string
    name: string
    description: string
    type: string
    instances: number
    variants: number
  }>
  styles: Array<{
    id: string
    name: string
    description: string
    type: string
    usage: number
  }>
  qualityMetrics: {
    overall: number
    accessibility: number
    performance: number
    maintainability: number
    consistency: number
    bestPractices: number
    designSystem: number
    codeGeneration: number
    issues: Array<{
      type: "warning" | "error" | "info"
      message: string
      nodeId?: string
      severity: number
    }>
    recommendations: Array<{
      id: string
      category: QualityCategory
      title: string
      description: string
      impact: string
      effort: "low" | "medium" | "high"
      priority: number
      actionItems: string[]
      resources: string[]
    }>
  }
  accessibility: {
    score: number
    issues: Array<{
      id: string
      type: string
      severity: "low" | "medium" | "high" | "critical"
      message: string
      nodeId: string
      wcagLevel: "A" | "AA" | "AAA"
      recommendation: string
    }>
    compliance: {
      wcagA: number
      wcagAA: number
      wcagAAA: number
    }
  }
  performance: {
    score: number
    metrics: {
      complexity: number
      renderTime: number
      memoryUsage: number
      bundleSize: number
    }
    optimizations: Array<{
      id: string
      type: string
      impact: "low" | "medium" | "high"
      description: string
      implementation: string
    }>
  }
}

export interface ProcessingStatus {
  id: string
  stage: string
  progress: number
  message: string
  startTime: Date
  estimatedCompletion?: Date
  errors: string[]
  warnings: string[]
}

export interface DisplayConfiguration {
  layout: "grid" | "list" | "tree"
  density: "compact" | "comfortable" | "spacious"
  groupBy: "type" | "layer" | "component" | "none"
  sortBy: "name" | "type" | "size" | "modified"
  sortOrder: "asc" | "desc"
  filters: any[]
  columns: string[]
  theme: "light" | "dark" | "auto"
}

export interface InteractionState {
  selectedNodes: string[]
  expandedNodes: Set<string>
  collapsedNodes: Set<string>
  searchQuery: string
  searchResults: string[]
  activeFilters: any[]
}

export interface FigmaNode {
  id: string
  name: string
  type: string
  visible: boolean
  locked: boolean
  children?: FigmaNode[]
  absoluteBoundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  fills?: any[]
  strokes?: any[]
  effects?: any[]
  constraints?: any
  layoutMode?: string
  primaryAxisSizingMode?: string
  counterAxisSizingMode?: string
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
  itemSpacing?: number
  cornerRadius?: number
  characters?: string
  style?: any
  characterStyleOverrides?: any[]
  styleOverrideTable?: any
  componentId?: string
  componentSetId?: string
  overrides?: any[]
  exportSettings?: any[]
  blendMode?: string
  opacity?: number
  isMask?: boolean
  maskType?: string
  clipsContent?: boolean
  background?: any[]
  backgroundColor?: any
  layoutGrids?: any[]
  guides?: any[]
  selection?: any[]
  selectedTextRange?: any
}

export interface FigmaFileInfo {
  id: string
  name: string
  description?: string
  version: string
  lastModified: string
  thumbnailUrl: string
  editorType: string
  linkAccess: string
  teamId?: string
  projectId?: string
  createdAt: string
  updatedAt: string
  fileSize: number
  nodeCount: number
  componentCount: number
  styleCount: number
}

export interface FigmaFileStatistics {
  totalNodes: number
  nodesByType: Record<string, number>
  totalComponents: number
  componentInstances: number
  totalStyles: number
  styleUsage: Record<string, number>
  layerDepth: number
  averageNestingLevel: number
  complexityScore: number
  designTokens: number
  colorPalette: any[] // FigmaColor
  fontFamilies: string[]
  imageAssets: number
  vectorAssets: number
}

export interface QualityMetrics {
  score: number
  issues: Array<{
    type: "warning" | "error" | "info"
    message: string
    nodeId?: string
    severity: number
  }>
  accessibility: {
    score: number
    issues: string[]
  }
  performance: {
    score: number
    metrics: Record<string, number>
  }
  consistency: {
    score: number
    violations: string[]
  }
}

export interface QualityIssue {
  id: string
  type: "error" | "warning" | "info"
  category: QualityCategory
  severity: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  nodeId?: string
  nodeName?: string
  suggestion: string
  autoFixable: boolean
  impact: string
  effort: "low" | "medium" | "high"
}

export interface QualityRecommendation {
  id: string
  category: QualityCategory
  title: string
  description: string
  impact: string
  effort: "low" | "medium" | "high"
  priority: number
  actionItems: string[]
  resources: string[]
}

export type QualityCategory =
  | "accessibility"
  | "performance"
  | "maintainability"
  | "consistency"
  | "naming"
  | "structure"
  | "design-system"
  | "responsive"
  | "code-generation"

export interface FigmaNodeTreeData {
  root: FigmaNodeTreeItem
  flatMap: Map<string, FigmaNodeTreeItem>
  searchIndex: SearchIndex
  statistics: NodeTreeStatistics
}

export interface FigmaNodeTreeItem {
  id: string
  name: string
  type: string
  visible: boolean
  locked: boolean
  children: FigmaNodeTreeItem[]
  parent?: FigmaNodeTreeItem
  depth: number
  path: string[]
  metadata: NodeMetadata
  issues: QualityIssue[]
  recommendations: QualityRecommendation[]
}

export interface NodeMetadata {
  bounds?: any // Rectangle
  constraints?: any // LayoutConstraint
  effects?: any[] // Effect
  fills?: any[] // Paint
  strokes?: any[] // Paint
  exportSettings?: any[] // ExportSetting
  componentInfo?: ComponentInfo
  styleInfo?: StyleInfo
  textInfo?: TextInfo
  layoutInfo?: LayoutInfo
}

export interface ComponentInfo {
  isComponent: boolean
  isInstance: boolean
  componentId?: string
  componentSetId?: string
  mainComponent?: string
  instanceOverrides?: Record<string, any>
  exposedProperties?: string[]
  variants?: Record<string, string>
}

export interface StyleInfo {
  appliedStyles: string[]
  localStyles: Record<string, any>
  inheritedStyles: Record<string, any>
  computedStyles: Record<string, any>
}

export interface TextInfo {
  content: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  lineHeight: number
  letterSpacing: number
  textAlign: string
  textDecoration: string
  textCase: string
}

export interface LayoutInfo {
  layoutMode?: string
  layoutWrap?: string
  itemSpacing?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  primaryAxisSizingMode?: string
  counterAxisSizingMode?: string
  primaryAxisAlignItems?: string
  counterAxisAlignItems?: string
}

export interface SearchIndex {
  byName: Map<string, FigmaNodeTreeItem[]>
  byType: Map<string, FigmaNodeTreeItem[]>
  byText: Map<string, FigmaNodeTreeItem[]>
  byComponent: Map<string, FigmaNodeTreeItem[]>
  byStyle: Map<string, FigmaNodeTreeItem[]>
  fullText: Map<string, FigmaNodeTreeItem[]>
}

export interface NodeTreeStatistics {
  totalNodes: number
  maxDepth: number
  averageDepth: number
  nodesByType: Record<string, number>
  nodesByDepth: Record<number, number>
  componentsCount: number
  instancesCount: number
  textNodesCount: number
  imageNodesCount: number
  vectorNodesCount: number
}

export interface ComponentAnalysis {
  id: string
  name: string
  description: string
  type: "component" | "component-set" | "instance"
  mainComponentId?: string
  componentSetId?: string
  variants?: Record<string, string>
  properties?: any[] // ComponentProperty
  instances: ComponentInstance[]
  usage: ComponentUsage
  quality: ComponentQuality
  documentation: ComponentDocumentation
  codeGeneration: ComponentCodeGeneration
}

export interface ComponentInstance {
  id: string
  name: string
  nodeId: string
  overrides: Record<string, any>
  variantProperties: Record<string, string>
  exposedProperties: Record<string, any>
}

export interface ComponentUsage {
  totalInstances: number
  uniqueVariants: number
  mostUsedVariant: string
  leastUsedVariant: string
  usageByPage: Record<string, number>
  usageByFrame: Record<string, number>
  usageFrequency: "high" | "medium" | "low"
}

export interface ComponentQuality {
  score: number
  consistency: number
  reusability: number
  maintainability: number
  accessibility: number
  issues: QualityIssue[]
  recommendations: QualityRecommendation[]
}

export interface ComponentDocumentation {
  hasDescription: boolean
  hasExamples: boolean
  hasUsageGuidelines: boolean
  hasAccessibilityNotes: boolean
  documentationScore: number
  missingDocumentation: string[]
}

export interface ComponentCodeGeneration {
  complexity: "low" | "medium" | "high"
  estimatedLines: number
  dependencies: string[]
  frameworks: SupportedFramework[]
  codeQuality: number
  maintainabilityScore: number
  testability: number
}

export type SupportedFramework = "react" | "vue" | "angular" | "html" | "react-native"

export interface StyleAnalysis {
  colors: Array<{
    name: string
    value: string
    usage: number
  }>
  typography: Array<{
    name: string
    fontFamily: string
    fontSize: number
    usage: number
  }>
  effects: Array<{
    name: string
    type: string
    usage: number
  }>
  grids: Array<{
    name: string
    pattern: string
    usage: number
  }>
}

export interface DesignToken {
  name: string
  value: string | number
  type: "color" | "spacing" | "typography" | "shadow" | "border" | "opacity"
  category: string
  description?: string
  aliases: string[]
}

export interface StyleCodeGeneration {
  cssProperties: Record<string, string>
  cssVariables: Record<string, string>
  scssVariables: Record<string, string>
  jsTokens: Record<string, any>
  tailwindClasses: string[]
  styledComponents: string
}

export interface AccessibilityReport {
  score: number
  level: "A" | "AA" | "AAA" | "fail"
  issues: AccessibilityIssue[]
  recommendations: AccessibilityRecommendation[]
  colorContrast: ColorContrastReport
  keyboardNavigation: KeyboardNavigationReport
  screenReader: ScreenReaderReport
  focusManagement: FocusManagementReport
}

export interface AccessibilityIssue {
  id: string
  rule: string
  level: "A" | "AA" | "AAA"
  severity: "critical" | "serious" | "moderate" | "minor"
  title: string
  description: string
  nodeId: string
  nodeName: string
  impact: string
  solution: string
  resources: string[]
}

export interface AccessibilityRecommendation {
  id: string
  category: string
  title: string
  description: string
  impact: string
  effort: "low" | "medium" | "high"
  priority: number
  implementation: string[]
  testing: string[]
}

export interface ColorContrastReport {
  score: number
  totalChecks: number
  passedChecks: number
  failedChecks: number
  issues: ColorContrastIssue[]
}

export interface ColorContrastIssue {
  nodeId: string
  nodeName: string
  foregroundColor: string
  backgroundColor: string
  contrastRatio: number
  requiredRatio: number
  level: "AA" | "AAA"
  size: "normal" | "large"
}

export interface KeyboardNavigationReport {
  score: number
  focusableElements: number
  tabOrder: TabOrderItem[]
  issues: KeyboardNavigationIssue[]
}

export interface TabOrderItem {
  nodeId: string
  nodeName: string
  tabIndex: number
  isFocusable: boolean
  hasVisibleFocus: boolean
}

export interface KeyboardNavigationIssue {
  nodeId: string
  nodeName: string
  issue: string
  severity: "critical" | "serious" | "moderate" | "minor"
  solution: string
}

export interface ScreenReaderReport {
  score: number
  elementsWithLabels: number
  elementsWithoutLabels: number
  issues: ScreenReaderIssue[]
}

export interface ScreenReaderIssue {
  nodeId: string
  nodeName: string
  issue: string
  severity: "critical" | "serious" | "moderate" | "minor"
  solution: string
}

export interface FocusManagementReport {
  score: number
  focusTraps: number
  skipLinks: number
  issues: FocusManagementIssue[]
}

export interface FocusManagementIssue {
  nodeId: string
  nodeName: string
  issue: string
  severity: "critical" | "serious" | "moderate" | "minor"
  solution: string
}

export interface PerformanceMetrics {
  score: number
  bundleSize: BundleSizeMetrics
  renderingPerformance: RenderingPerformanceMetrics
  memoryUsage: MemoryUsageMetrics
  networkRequests: NetworkRequestMetrics
  codeComplexity: CodeComplexityMetrics
  optimizations: PerformanceOptimization[]
}

export interface BundleSizeMetrics {
  estimatedSize: number
  compressedSize: number
  jsSize: number
  cssSize: number
  imageSize: number
  fontSize: number
  breakdown: Record<string, number>
}

export interface RenderingPerformanceMetrics {
  estimatedFCP: number
  estimatedLCP: number
  estimatedCLS: number
  estimatedFID: number
  renderingComplexity: number
  reflows: number
  repaints: number
}

export interface MemoryUsageMetrics {
  estimatedMemory: number
  domNodes: number
  eventListeners: number
  memoryLeaks: MemoryLeak[]
}

export interface MemoryLeak {
  type: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  solution: string
}

export interface NetworkRequestMetrics {
  totalRequests: number
  imageRequests: number
  fontRequests: number
  apiRequests: number
  totalSize: number
  cacheable: number
  optimizable: number
}

export interface CodeComplexityMetrics {
  cyclomaticComplexity: number
  cognitiveComplexity: number
  maintainabilityIndex: number
  technicalDebt: number
  codeSmells: CodeSmell[]
}

export interface CodeSmell {
  type: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  refactoring: string
  impact: string
}

export interface PerformanceOptimization {
  type: string
  description: string
  impact: string
  effort: "low" | "medium" | "high"
  savings: string
  implementation: string[]
}

// Export and Integration Types
export interface ExportConfiguration {
  format: ExportFormat
  options: ExportOptions
  destination: ExportDestination
  schedule?: ExportSchedule
}

export type ExportFormat = "json" | "csv" | "xlsx" | "pdf" | "html" | "markdown" | "figma-tokens"

export interface ExportOptions {
  includeMetadata: boolean
  includeQualityMetrics: boolean
  includeAccessibilityReport: boolean
  includePerformanceMetrics: boolean
  includeRecommendations: boolean
  includeCodeGeneration: boolean
  compression: "none" | "gzip" | "brotli"
  formatting: "minified" | "pretty"
}

export interface ExportDestination {
  type: "download" | "email" | "webhook" | "cloud-storage"
  config: Record<string, any>
}

export interface ExportSchedule {
  frequency: "once" | "daily" | "weekly" | "monthly"
  time?: string
  timezone?: string
  enabled: boolean
}

export interface ViewportConfiguration {
  width: number
  height: number
  zoom: number
  panX: number
  panY: number
  fitToScreen: boolean
  showGrid: boolean
  showRulers: boolean
  showGuides: boolean
}

export interface AnalysisResult {
  fileInfo: {
    name: string
    lastModified: string
    version: string
    pages: number
    components: number
    styles: number
  }
  statistics: {
    totalNodes: number
    nodeTypes: Record<string, number>
    layers: number
    components: number
    instances: number
    styles: number
    colors: number
    fonts: number
  }
  quality: {
    score: number
    issues: QualityIssue[]
    accessibility: AccessibilityIssue[]
    performance: PerformanceMetric[]
  }
  components: ComponentInfo[]
  styles: StyleInfo[]
  exportHistory: ExportRecord[]
}

export interface ExportRecord {
  id: string
  format: string
  timestamp: Date
  size: number
  status: "success" | "error" | "pending"
  downloadUrl?: string
}

export interface SearchFilter {
  nodeType?: string[]
  hasChildren?: boolean
  visible?: boolean
  locked?: boolean
  hasStyles?: boolean
  nameContains?: string
}

export interface SavedSearch {
  id: string
  name: string
  query: string
  filters: SearchFilter
  timestamp: Date
  resultCount: number
}

export interface PerformanceMetric {
  id: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  message: string
  nodeId?: string
  recommendation?: string
}

export interface FigmaInfoDisplayProps {
  figmaData: any
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

export interface NodeAnalysis {
  totalNodes: number
  nodeTypes: Record<string, number>
  componentInstances: number
  textNodes: number
  imageNodes: number
  vectorNodes: number
  frameNodes: number
  groupNodes: number
  maxDepth: number
  averageDepth: number
}
