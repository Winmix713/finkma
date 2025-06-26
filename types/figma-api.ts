/**
 * Comprehensive Figma API types for enterprise-grade integration
 */

export interface FigmaApiResponse {
  document: any;
  components: Record<string, any>;
  componentSets: Record<string, any>;
  styles: Record<string, any>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  role: string;
  editorType: string;
  linkAccess: string;
  schemaVersion: number;
  mainFileKey?: string;
  branches?: any[];
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  children?: FigmaNode[];
  backgroundColor?: any;
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  constraints?: any;
  layoutMode?: string;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  cornerRadius?: number;
  characters?: string;
  style?: any;
  characterStyleOverrides?: any[];
  styleOverrideTable?: any;
  componentId?: string;
  componentSetId?: string;
  overrides?: any[];
  exportSettings?: any[];
  blendMode?: string;
  opacity?: number;
  isMask?: boolean;
  maskType?: string;
  clipsContent?: boolean;
  background?: any[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  layoutGrids?: any[];
  guides?: any[];
  selection?: any[];
  selectedTextRange?: any;
}

export type FigmaNodeType =
  | "DOCUMENT"
  | "CANVAS"
  | "FRAME"
  | "GROUP"
  | "VECTOR"
  | "BOOLEAN_OPERATION"
  | "STAR"
  | "LINE"
  | "ELLIPSE"
  | "REGULAR_POLYGON"
  | "RECTANGLE"
  | "TEXT"
  | "SLICE"
  | "COMPONENT"
  | "COMPONENT_SET"
  | "INSTANCE"
  | "STICKY"
  | "SHAPE_WITH_TEXT"
  | "CONNECTOR"
  | "WIDGET"
  | "EMBED"
  | "LINK_UNFURL"
  | "MEDIA"
  | "SECTION"
  | "HIGHLIGHT"
  | "STAMP"
  | "WASHI_TAPE";

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  componentSetId?: string;
  documentationLinks: DocumentationLink[];
  remote: boolean;
}

export interface FigmaComponentSet {
  key: string;
  name: string;
  description: string;
  documentationLinks: DocumentationLink[];
  remote: boolean;
}

export interface FigmaStyle {
  key: string;
  name: string;
  description: string;
  remote: boolean;
  styleType: StyleType;
}

export type StyleType = "FILL" | "TEXT" | "EFFECT" | "GRID";

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Paint {
  type: PaintType;
  visible?: boolean;
  opacity?: number;
  color?: FigmaColor;
  blendMode?: string;
  gradientHandlePositions?: Vector[];
  gradientStops?: ColorStop[];
  scaleMode?: string;
  imageTransform?: Transform;
  scalingFactor?: number;
  rotation?: number;
  imageRef?: string;
  filters?: ImageFilters;
  gifRef?: string;
  boundVariables?: Record<string, VariableAlias>;
}

export type PaintType =
  | "SOLID"
  | "GRADIENT_LINEAR"
  | "GRADIENT_RADIAL"
  | "GRADIENT_ANGULAR"
  | "GRADIENT_DIAMOND"
  | "IMAGE"
  | "EMOJI"
  | "VIDEO";

export interface Effect {
  type: EffectType;
  visible?: boolean;
  radius?: number;
  color?: FigmaColor;
  blendMode?: string;
  offset?: Vector;
  spread?: number;
  showShadowBehindNode?: boolean;
  boundVariables?: Record<string, VariableAlias>;
}

export type EffectType =
  | "INNER_SHADOW"
  | "DROP_SHADOW"
  | "LAYER_BLUR"
  | "BACKGROUND_BLUR";

export type BlendMode =
  | "PASS_THROUGH"
  | "NORMAL"
  | "DARKEN"
  | "MULTIPLY"
  | "LINEAR_BURN"
  | "COLOR_BURN"
  | "LIGHTEN"
  | "SCREEN"
  | "LINEAR_DODGE"
  | "COLOR_DODGE"
  | "OVERLAY"
  | "SOFT_LIGHT"
  | "HARD_LIGHT"
  | "DIFFERENCE"
  | "EXCLUSION"
  | "HUE"
  | "SATURATION"
  | "COLOR"
  | "LUMINOSITY";

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutConstraint {
  vertical: ConstraintType;
  horizontal: ConstraintType;
}

export type ConstraintType = "MIN" | "CENTER" | "MAX" | "STRETCH" | "SCALE";

export interface ExportSetting {
  suffix: string;
  format: ExportFormat;
  constraint: Constraint;
}

export type ExportFormat = "JPG" | "PNG" | "SVG" | "PDF";

export interface Constraint {
  type: ConstraintType;
  value: number;
}

export interface TextStyle {
  fontFamily?: string;
  fontPostScriptName?: string;
  paragraphSpacing?: number;
  paragraphIndent?: number;
  listSpacing?: number;
  hangingPunctuation?: boolean;
  hangingList?: boolean;
  italic?: boolean;
  fontWeight?: number;
  fontSize?: number;
  textCase?: TextCase;
  textDecoration?: TextDecoration;
  textAutoResize?: TextAutoResize;
  textTruncation?: TextTruncation;
  maxLines?: number;
  textAlignHorizontal?: TextAlignHorizontal;
  textAlignVertical?: TextAlignVertical;
  letterSpacing?: LetterSpacing;
  fills?: any[];
  hyperlink?: Hyperlink;
  opentypeFlags?: Record<string, number>;
  lineHeight?: LineHeight;
  leadingTrim?: LeadingTrim;
  boundVariables?: Record<string, VariableAlias>;
}

export type TextCase =
  | "ORIGINAL"
  | "UPPER"
  | "LOWER"
  | "TITLE"
  | "SMALL_CAPS"
  | "SMALL_CAPS_FORCED";

export type TextDecoration = "NONE" | "UNDERLINE" | "STRIKETHROUGH";

export type TextAutoResize =
  | "NONE"
  | "HEIGHT"
  | "WIDTH_AND_HEIGHT"
  | "TRUNCATE";

export type TextTruncation = "DISABLED" | "ENDING";

export type TextAlignHorizontal = "LEFT" | "RIGHT" | "CENTER" | "JUSTIFIED";

export type TextAlignVertical = "TOP" | "CENTER" | "BOTTOM";

export interface LetterSpacing {
  value: number;
  unit: LetterSpacingUnit;
}

export type LetterSpacingUnit = "PIXELS" | "PERCENT";

export interface LineHeight {
  value: number;
  unit: LineHeightUnit;
}

export type LineHeightUnit = "PIXELS" | "PERCENT" | "AUTO";

export type LeadingTrim = "NONE" | "CAP_HEIGHT" | "CAP_HEIGHT_LEGACY";

export interface Hyperlink {
  type: HyperlinkType;
  url?: string;
  nodeID?: string;
}

export type HyperlinkType = "URL" | "NODE";

export interface DocumentationLink {
  uri: string;
}

export interface Vector {
  x: number;
  y: number;
}

export interface ColorStop {
  position: number;
  color: FigmaColor;
  boundVariables?: Record<string, VariableAlias>;
}

export interface Transform {
  m00: number;
  m01: number;
  m02: number;
  m10: number;
  m11: number;
  m12: number;
}

export interface ImageFilters {
  exposure?: number;
  contrast?: number;
  saturation?: number;
  temperature?: number;
  tint?: number;
  highlights?: number;
  shadows?: number;
}

export interface VariableAlias {
  type: "VARIABLE_ALIAS";
  id: string;
}

// Additional utility types for enhanced functionality
export interface FigmaFileMetadata {
  id: string;
  name: string;
  thumbnail: string;
  lastModified: string;
  version: string;
  description?: string;
  teamId?: string;
  projectId?: string;
}

export interface FigmaFileInfo {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

export interface FigmaTeam {
  id: string;
  name: string;
}

export interface FigmaProject {
  id: string;
  name: string;
}

export interface FigmaUser {
  id: string;
  email: string;
  handle: string;
  img_url: string;
}

export interface FigmaComment {
  id: string;
  file_key: string;
  parent_id?: string;
  user: FigmaUser;
  created_at: string;
  resolved_at?: string;
  message: string;
  client_meta: Vector;
  order_id: string;
}

export interface FigmaVersion {
  id: string;
  created_at: string;
  label: string;
  description: string;
  user: FigmaUser;
  thumbnail_url: string;
}

export interface FigmaCommentsResponse {
  comments: any[];
}

export interface FigmaVersionInfo {
  id: string;
  created_at: string;
  label: string;
  description: string;
  user: FigmaUser;
}

// Error types
export interface FigmaApiError {
  status: number;
  err: string;
  message?: string;
}

// Request types
export interface FigmaFileRequest {
  fileKey: string;
  version?: string;
  ids?: string[];
  depth?: number;
  geometry?: "paths" | "vector";
  plugin_data?: string;
  branch_data?: boolean;
}

export interface FigmaImageRequest {
  fileKey: string;
  ids: string[];
  scale?: number;
  format?: "jpg" | "png" | "svg" | "pdf";
  svg_include_id?: boolean;
  svg_simplify_stroke?: boolean;
  use_absolute_bounds?: boolean;
  version?: string;
}

export interface FigmaImageResponse {
  err?: string;
  images: Record<string, string>;
  status?: number;
}

// Component and style metadata
export interface ComponentMetadata {
  key: string;
  file_key: string;
  node_id: string;
  thumbnail_url: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user: FigmaUser;
  containing_frame?: {
    nodeId: string;
    name: string;
    backgroundColor: string;
    pageName: string;
    pageId: string;
  };
}

export interface StyleMetadata {
  key: string;
  file_key: string;
  node_id: string;
  style_type: StyleType;
  thumbnail_url: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user: FigmaUser;
  sort_position: string;
}

// Team and project types
export interface TeamProjectsResponse {
  name: string;
  projects: FigmaProject[];
}

export interface ProjectFilesResponse {
  name: string;
  files: FigmaFileMetadata[];
}

// Webhook types
export interface FigmaWebhook {
  id: string;
  team_id: string;
  event_type: WebhookEventType;
  client_id: string;
  endpoint: string;
  passcode: string;
  status: "ACTIVE" | "PAUSED";
  description: string;
  protocol_version: string;
}

export type WebhookEventType =
  | "FILE_UPDATE"
  | "FILE_DELETE"
  | "FILE_VERSION_UPDATE"
  | "LIBRARY_PUBLISH";

export interface WebhookPayload {
  event_type: WebhookEventType;
  file_key: string;
  file_name: string;
  timestamp: string;
  triggered_by: FigmaUser;
  description?: string;
  version_id?: string;
  label?: string;
  created_components?: ComponentMetadata[];
  modified_components?: ComponentMetadata[];
  deleted_components?: ComponentMetadata[];
  created_styles?: StyleMetadata[];
  modified_styles?: StyleMetadata[];
  deleted_styles?: StyleMetadata[];
}

// Plugin and widget types
export interface FigmaPlugin {
  id: string;
  name: string;
  description: string;
  versions: PluginVersion[];
}

export interface PluginVersion {
  id: string;
  name: string;
  description: string;
  version: string;
  status:
    | "UNPUBLISHED"
    | "PENDING_REVIEW"
    | "REJECTED"
    | "APPROVED"
    | "PUBLISHED";
}

export interface FigmaWidget {
  id: string;
  name: string;
  description: string;
  versions: WidgetVersion[];
}

export interface WidgetVersion {
  id: string;
  name: string;
  description: string;
  version: string;
  status:
    | "UNPUBLISHED"
    | "PENDING_REVIEW"
    | "REJECTED"
    | "APPROVED"
    | "PUBLISHED";
}

// Dev resources types
export interface DevResource {
  name: string;
  url: string;
  file_key: string;
  node_id: string;
}

export interface DevResourcesResponse {
  dev_resources: DevResource[];
}

// Variables and modes (Figma Variables API)
export interface FigmaVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: VariableResolvedDataType;
  valuesByMode: Record<string, VariableValue>;
  remote: boolean;
  description: string;
  hiddenFromPublishing: boolean;
  scopes: VariableScope[];
  codeSyntax: Record<string, string>;
}

export type VariableResolvedDataType = "BOOLEAN" | "FLOAT" | "STRING" | "COLOR";

export type VariableValue =
  | boolean
  | number
  | string
  | FigmaColor
  | VariableAlias;

export type VariableScope =
  | "ALL_SCOPES"
  | "TEXT_CONTENT"
  | "CORNER_RADIUS"
  | "WIDTH_HEIGHT"
  | "GAP"
  | "ALL_FILLS"
  | "FRAME_FILL"
  | "SHAPE_FILL"
  | "TEXT_FILL"
  | "STROKE_COLOR"
  | "EFFECT_COLOR"
  | "OPACITY"
  | "STROKE_FLOAT";

export interface VariableCollection {
  id: string;
  name: string;
  key: string;
  modes: VariableMode[];
  defaultModeId: string;
  remote: boolean;
  hiddenFromPublishing: boolean;
  variableIds: string[];
}

export interface VariableMode {
  modeId: string;
  name: string;
}

export interface LocalVariablesResponse {
  status: number;
  error: boolean;
  meta: {
    variables: Record<string, FigmaVariable>;
    variableCollections: Record<string, VariableCollection>;
  };
}

export interface PublishedVariablesResponse {
  status: number;
  error: boolean;
  meta: {
    variables: Record<string, FigmaVariable>;
    variableCollections: Record<string, VariableCollection>;
  };
}

export interface RateLimit {
  limit: number;
  remaining: number;
  reset: Date;
}

export interface ConnectionStats {
  isConnected: boolean;
  lastConnectedAt?: Date;
  rateLimit: RateLimit;
  cache: {
    hitRate: number;
    size: number;
    maxSize: number;
  };
  userInfo?: FigmaUser;
  uptime?: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
}

export interface ApiValidationResult {
  isValid: boolean;
  user?: FigmaUser;
  error?: string;
}

export interface FigmaStatistics {
  totalNodes: number;
  totalComponents: number;
  totalStyles: number;
  nodesByType: Record<string, number>;
  componentsByType: Record<string, number>;
  stylesByType: Record<string, number>;
  maxDepth: number;
  averageDepth: number;
}

export interface QualityMetrics {
  overall: number;
  accessibility: number;
  performance: number;
  maintainability: number;
  consistency: number;
  issues: QualityIssue[];
  recommendations: QualityRecommendation[];
}

export interface QualityIssue {
  id: string;
  type: "error" | "warning" | "info";
  category: string;
  message: string;
  nodeId?: string;
  severity: number;
  fixable: boolean;
}

export interface QualityRecommendation {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  category: string;
}
