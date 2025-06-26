export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  children?: FigmaNode[];
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  constraints?: any;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  size?: {
    x: number;
    y: number;
  };
  relativeTransform?: number[][];
  clipsContent?: boolean;
  background?: any[];
  backgroundColor?: any;
  exportSettings?: any[];
  blendMode?: string;
  preserveRatio?: boolean;
  layoutAlign?: string;
  layoutGrow?: number;
  opacity?: number;
  isMask?: boolean;
  maskType?: string;
  characters?: string;
  style?: any;
  characterStyleOverrides?: any[];
  styleOverrideTable?: any;
  lineTypes?: string[];
  lineIndentations?: number[];
  componentId?: string;
  componentSetId?: string;
  overrides?: any[];
  isExposedInstance?: boolean;
  exposedInstances?: string[];
  transitionNodeID?: string;
  transitionDuration?: number;
  transitionEasing?: string;
  overlayPositionType?: string;
  overlayBackground?: any;
  overlayBackgroundInteraction?: string;
}

export interface FigmaFile {
  name: string;
  role: string;
  lastModified: string;
  editorType: string;
  thumbnailUrl: string;
  version: string;
  document: FigmaNode;
  components: Record<string, any>;
  componentSets: Record<string, any>;
  schemaVersion: number;
  styles: Record<string, any>;
  mainFileKey?: string;
  branches?: any[];
}

export interface ProcessingResult {
  id: string;
  url: string;
  data: FigmaFile;
  processingTime: number;
  timestamp: Date;
  status: "success" | "error";
}

export interface ProcessingError {
  id: string;
  url: string;
  error: string;
  timestamp: Date;
  retryCount: number;
}
