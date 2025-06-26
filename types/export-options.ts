/**
 * Export configuration and options types
 */

export interface ExportConfiguration {
  /** Export format */
  format: ExportFormat;
  /** Output options */
  output: OutputOptions;
  /** Token filtering */
  tokenFilter: TokenFilter;
  /** Format-specific options */
  formatOptions: FormatOptions;
  /** Export metadata */
  metadata: ExportMetadata;
}

export type ExportFormat =
  | "css"
  | "scss"
  | "less"
  | "stylus"
  | "javascript"
  | "typescript"
  | "json"
  | "yaml"
  | "tailwind"
  | "figma-tokens"
  | "style-dictionary"
  | "android-xml"
  | "ios-swift";

export interface OutputOptions {
  /** Output filename */
  filename: string;
  /** Whether to minify output */
  minify: boolean;
  /** Whether to include comments */
  includeComments: boolean;
  /** Indentation style */
  indentation: "tabs" | "spaces";
  /** Indentation size */
  indentationSize: number;
  /** Line ending style */
  lineEndings: "lf" | "crlf";
}

export interface TokenFilter {
  /** Include specific categories */
  includeCategories?: string[];
  /** Exclude specific categories */
  excludeCategories?: string[];
  /** Include specific tokens by ID */
  includeTokens?: string[];
  /** Exclude specific tokens by ID */
  excludeTokens?: string[];
  /** Filter by tags */
  tags?: string[];
  /** Only include valid tokens */
  validOnly?: boolean;
}

export type FormatOptions =
  | CSSFormatOptions
  | SCSSFormatOptions
  | JavaScriptFormatOptions
  | TypeScriptFormatOptions
  | JSONFormatOptions
  | TailwindFormatOptions
  | FigmaTokensFormatOptions;

export interface CSSFormatOptions {
  /** CSS variable prefix */
  prefix: string;
  /** Whether to use CSS custom properties */
  useCustomProperties: boolean;
  /** Selector for CSS variables */
  selector: string;
  /** Whether to include fallbacks */
  includeFallbacks: boolean;
}

export interface SCSSFormatOptions {
  /** SCSS variable prefix */
  prefix: string;
  /** Whether to use !default flag */
  useDefault: boolean;
  /** Whether to create mixins */
  createMixins: boolean;
  /** Map name for token maps */
  mapName: string;
}

export interface JavaScriptFormatOptions {
  /** Export style */
  exportStyle: "commonjs" | "esm" | "umd";
  /** Whether to use const assertions */
  useConstAssertions: boolean;
  /** Object structure */
  objectStructure: "flat" | "nested";
}

export interface TypeScriptFormatOptions extends JavaScriptFormatOptions {
  /** Whether to generate type definitions */
  generateTypes: boolean;
  /** Type definition style */
  typeStyle: "interface" | "type";
}

export interface JSONFormatOptions {
  /** JSON structure */
  structure: "flat" | "nested" | "grouped";
  /** Whether to include metadata */
  includeMetadata: boolean;
  /** Pretty print with indentation */
  prettyPrint: boolean;
}

export interface TailwindFormatOptions {
  /** Tailwind config section */
  configSection: "theme" | "extend";
  /** Whether to include utilities */
  includeUtilities: boolean;
  /** Custom utility prefix */
  utilityPrefix?: string;
}

export interface FigmaTokensFormatOptions {
  /** Figma Tokens format version */
  version: "1.0" | "2.0";
  /** Whether to include sets */
  includeSets: boolean;
  /** Set organization */
  setOrganization: "category" | "theme" | "component";
}

export interface ExportMetadata {
  /** Export timestamp */
  exportedAt: Date;
  /** Export version */
  version: string;
  /** Source information */
  source: SourceInfo;
  /** Export statistics */
  statistics: ExportStatistics;
}

export interface SourceInfo {
  /** Figma file information */
  figmaFile?: FigmaFileInfo;
  /** Design system name */
  designSystemName: string;
  /** Design system version */
  designSystemVersion: string;
}

export interface FigmaFileInfo {
  /** File key */
  key: string;
  /** File name */
  name: string;
  /** Last modified date */
  lastModified: Date;
  /** File URL */
  url: string;
}

export interface ExportStatistics {
  /** Total tokens exported */
  totalTokens: number;
  /** Tokens by category */
  tokensByCategory: Record<string, number>;
  /** Export file size */
  fileSize: number;
  /** Export duration */
  duration: number;
}

export interface ExportResult {
  /** Export success status */
  success: boolean;
  /** Generated content */
  content?: string;
  /** Export metadata */
  metadata: ExportMetadata;
  /** Export errors */
  errors: ExportError[];
  /** Export warnings */
  warnings: ExportWarning[];
}

export interface ExportError {
  code: string;
  message: string;
  tokenId?: string;
  severity: "error" | "warning";
}

export interface ExportWarning {
  code: string;
  message: string;
  tokenId?: string;
  suggestion?: string;
}

export interface BatchExportConfiguration {
  /** Multiple export configurations */
  exports: ExportConfiguration[];
  /** Batch options */
  options: BatchExportOptions;
}

export interface BatchExportOptions {
  /** Whether to create a zip file */
  createZip: boolean;
  /** Zip filename */
  zipFilename?: string;
  /** Whether to continue on errors */
  continueOnError: boolean;
  /** Parallel export limit */
  parallelLimit: number;
}

export interface BatchExportResult {
  /** Individual export results */
  results: ExportResult[];
  /** Batch statistics */
  statistics: BatchExportStatistics;
  /** Overall success status */
  success: boolean;
}

export interface BatchExportStatistics {
  /** Total exports attempted */
  totalExports: number;
  /** Successful exports */
  successfulExports: number;
  /** Failed exports */
  failedExports: number;
  /** Total duration */
  totalDuration: number;
  /** Total file size */
  totalFileSize: number;
}
