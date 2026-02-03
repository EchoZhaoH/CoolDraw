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

export type CanvasNodeType = "geometry" | "text" | "connector";

export type BaseNode<TType extends CanvasNodeType = CanvasNodeType> = {
  id: string;
  type: TType;
  position: Position;
  size: Size;
  rotation?: number;
  data?: Record<string, unknown>;
};

export type CanvasGeometryNode = BaseNode<"geometry"> & {
  kind?: "rect" | "ellipse";
};

export type CanvasTextNode = BaseNode<"text">;

export type ConnectorEndpoint = {
  nodeId?: string;
  anchorId?: string;
  position?: Position;
  offset?: Position;
};

export type ArrowStyle = {
  type?: "none" | "triangle" | "circle" | "diamond";
  size?: number;
  filled?: boolean;
};

export type ConnectorStyle = {
  stroke?: string;
  strokeWidth?: number;
  dash?: number[];
  opacity?: number;
  lineType?: "straight" | "orthogonal" | "curve";
  arrowStart?: ArrowStyle;
  arrowEnd?: ArrowStyle;
};

export type CanvasConnectorNode = BaseNode<"connector"> & {
  mode: "free" | "linked";
  source: ConnectorEndpoint;
  target: ConnectorEndpoint;
  style?: ConnectorStyle;
};

export type CanvasNode =
  | CanvasGeometryNode
  | CanvasTextNode
  | CanvasConnectorNode;

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
