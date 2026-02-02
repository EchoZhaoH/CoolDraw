export type Position = {
  x: number;
  y: number;
};

export type Point = Position;

export type Size = {
  width: number;
  height: number;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CanvasNode = {
  id: string;
  type: string;
  kind?: "rect" | "ellipse";
  position: Position;
  size: Size;
  rotation?: number;
  data?: Record<string, unknown>;
};

export type CanvasEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  data?: Record<string, unknown>;
};

export type CanvasGroup = {
  id: string;
  name: string;
  nodeIds: string[];
};

export type Selection = {
  nodeIds: string[];
  edgeIds: string[];
  groupIds: string[];
  mode?: "single" | "multi";
  box?: { x: number; y: number; width: number; height: number };
};

export type Viewport = {
  x: number;
  y: number;
  scale: number;
};

export type CanvasState = {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  groups: CanvasGroup[];
  selection: Selection;
  viewport: Viewport;
  updatedAt: number;
};
