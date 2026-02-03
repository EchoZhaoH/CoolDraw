export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type Anchor = { id: string; position: Point };

export type StyleProps = {
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  opacity?: number;
  dash?: number[];
  cornerRadius?: number;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
};

export type Traits = {
  draggable?: boolean;
  resizable?: boolean;
  rotatable?: boolean;
  connectable?: boolean;
  textEditable?: boolean;
};

export type BaseShape = {
  id: string;
  type: string;
  position: Point;
  size: { width: number; height: number };
  rotation?: number;
  style?: StyleProps;
  data?: Record<string, unknown>;
  meta?: {
    locked?: boolean;
    hidden?: boolean;
    createdAt?: number;
    updatedAt?: number;
    schemaVersion?: number;
  };
};

export type GeometryShape = BaseShape & {
  type: "geometry";
  kind: "rect" | "ellipse";
  style?: StyleProps & { cornerRadius?: number };
};

export type TextShape = BaseShape & {
  type: "text";
  data?: {
    text?: string;
    fontSize?: number;
    fontFamily?: string;
  };
};

export type CanvasAction = {
  type: string;
  payload?: unknown;
  source?: "user" | "ai" | "collab";
  timestamp?: number;
};

export type RenderContext = {
  stage?: unknown;
  layers?: {
    nodes?: unknown;
    edges?: unknown;
    overlay?: unknown;
  };
  viewCache?: Map<string, unknown>;
  state?: unknown;
};

export type InteractionContext = {
  pointer: Point;
  actions: (action: CanvasAction) => void;
  state?: unknown;
};

export type ShapeHandler<T extends BaseShape = BaseShape> = {
  render: (shape: T, ctx: RenderContext) => void;
  hitTest: (shape: T, point: Point) => boolean;
  getBounds: (shape: T) => Rect;
  getAnchors?: (shape: T) => Anchor[];
  getSnapPoints?: (shape: T) => Point[];
  onPointerDown?: (shape: T, ctx: InteractionContext) => CanvasAction[];
  onPointerMove?: (shape: T, ctx: InteractionContext) => CanvasAction[];
  onPointerUp?: (shape: T, ctx: InteractionContext) => CanvasAction[];
  traits?: Traits;
};
