import type {
  ArrowStyle,
  CanvasConnectorNode,
  CanvasNode,
  CanvasState,
  ConnectorEndpoint,
  ConnectorStyle,
  Point,
  Rect
} from "@/types/canvas";
import { getShapeHandler } from "./registry";
import { rotatePoint } from "@/controls/utils";

const parseColor = (color: string) =>
  Number.parseInt(color.replace("#", "0x"), 16);

const getDefaultAnchors = (bounds: Rect) => {
  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;
  return [
    { id: "c", position: { x: cx, y: cy } },
    { id: "n", position: { x: cx, y: bounds.y } },
    { id: "e", position: { x: bounds.x + bounds.width, y: cy } },
    { id: "s", position: { x: cx, y: bounds.y + bounds.height } },
    { id: "w", position: { x: bounds.x, y: cy } }
  ];
};

const getNodeBounds = (node: CanvasNode): Rect => {
  const handler = getShapeHandler(node as never);
  if (handler?.getBounds) {
    return handler.getBounds(node as never);
  }
  return {
    x: node.position.x,
    y: node.position.y,
    width: node.size.width,
    height: node.size.height
  };
};

const getAnchorsForNode = (node: CanvasNode, bounds: Rect) => {
  const handler = getShapeHandler(node as never);
  if (handler?.getAnchors) {
    return handler.getAnchors(node as never);
  }
  return getDefaultAnchors(bounds);
};

export const resolveEndpoint = (
  endpoint: ConnectorEndpoint,
  state: CanvasState
): Point => {
  if (endpoint.nodeId) {
    const node = state.nodes.find((item) => item.id === endpoint.nodeId);
    if (node) {
      const bounds = getNodeBounds(node);
      const anchors = getAnchorsForNode(node, bounds);
      const center = {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2
      };
      const anchor =
        anchors.find((item) => item.id === endpoint.anchorId) ??
        anchors.find((item) => item.id === "c") ??
        { id: "c", position: center };
      const rotation = node.rotation ?? 0;
      const rotated = rotation !== 0
        ? rotatePoint(anchor.position, center, rotation)
        : anchor.position;
      const offset = endpoint.offset ?? { x: 0, y: 0 };
      return {
        x: rotated.x + offset.x,
        y: rotated.y + offset.y
      };
    }
  }
  return endpoint.position ?? { x: 0, y: 0 };
};

export const getEndpointPosition = (endpoint: ConnectorEndpoint) =>
  endpoint.position ?? { x: 0, y: 0 };

export const getConnectorStyle = (style?: ConnectorStyle) => {
  const stroke = style?.stroke ?? "#94a3b8";
  const strokeWidth = style?.strokeWidth ?? 2;
  const opacity = style?.opacity ?? 0.9;
  const dash = style?.dash ?? [];
  return {
    stroke,
    strokeWidth,
    opacity,
    dash,
    strokeColor: parseColor(stroke)
  };
};

export const getConnectorLineType = (connector: CanvasConnectorNode) =>
  connector.style?.lineType ?? "curve";

export const getConnectorPoints = (connector: CanvasConnectorNode, state: CanvasState) => {
  const source = resolveEndpoint(connector.source, state);
  const target = resolveEndpoint(connector.target, state);
  const lineType = getConnectorLineType(connector);
  return { source, target, lineType };
};

const getCurveControl = (source: Point, target: Point) => {
  const mx = (source.x + target.x) / 2;
  const my = (source.y + target.y) / 2;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const offset = Math.min(80, len / 3);
  return { x: mx + nx * offset, y: my + ny * offset };
};

export const buildPathPoints = (source: Point, target: Point, lineType: string) => {
  if (lineType === "orthogonal") {
    const midX = (source.x + target.x) / 2;
    return [
      source,
      { x: midX, y: source.y },
      { x: midX, y: target.y },
      target
    ];
  }
  if (lineType === "straight") {
    return [source, target];
  }
  const control = getCurveControl(source, target);
  const points: Point[] = [];
  const segments = 20;
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const mt = 1 - t;
    points.push({
      x: mt * mt * source.x + 2 * mt * t * control.x + t * t * target.x,
      y: mt * mt * source.y + 2 * mt * t * control.y + t * t * target.y
    });
  }
  return points;
};

export const getBoundsFromPoints = (points: Point[], padding = 6) => {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2
  };
};

export const findAnchorAtPoint = (
  state: CanvasState,
  point: Point,
  radius: number
) => {
  const r2 = radius * radius;
  for (const node of state.nodes) {
    if (node.type === "connector") {
      continue;
    }
    const bounds = getNodeBounds(node);
    const anchors = getAnchorsForNode(node, bounds);
    const center = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2
    };
    const rotation = node.rotation ?? 0;
    for (const anchor of anchors) {
      const position =
        rotation !== 0
          ? rotatePoint(anchor.position, center, rotation)
          : anchor.position;
      const dx = point.x - position.x;
      const dy = point.y - position.y;
      if (dx * dx + dy * dy <= r2) {
        return {
          nodeId: node.id,
          anchorId: anchor.id,
          position
        };
      }
    }
  }
  return null;
};

export const hitTestEndpoint = (
  point: Point,
  source: Point,
  target: Point,
  radius: number
) => {
  const r2 = radius * radius;
  const d1 = (point.x - source.x) ** 2 + (point.y - source.y) ** 2;
  if (d1 <= r2) {
    return "source";
  }
  const d2 = (point.x - target.x) ** 2 + (point.y - target.y) ** 2;
  if (d2 <= r2) {
    return "target";
  }
  return null;
};

const distanceToSegment = (point: Point, a: Point, b: Point) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) {
    return Math.hypot(point.x - a.x, point.y - a.y);
  }
  let t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: a.x + t * dx, y: a.y + t * dy };
  return Math.hypot(point.x - proj.x, point.y - proj.y);
};

export const hitTestLine = (point: Point, points: Point[], threshold: number) => {
  for (let i = 0; i < points.length - 1; i += 1) {
    if (distanceToSegment(point, points[i], points[i + 1]) <= threshold) {
      return true;
    }
  }
  return false;
};

export const getArrowStyle = (style?: ArrowStyle) => ({
  type: (style?.type ?? "none") as "none" | "triangle" | "circle" | "diamond",
  size: style?.size ?? 10,
  filled: style?.filled ?? true
});

export const getArrowDirection = (points: Point[], atStart: boolean) => {
  if (points.length < 2) {
    return { x: 1, y: 0 };
  }
  const from = atStart ? points[1] : points[points.length - 2];
  const to = atStart ? points[0] : points[points.length - 1];
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
};

export const buildArrowPath = (point: Point, dir: Point, style: ArrowStyle) => {
  const size = style.size ?? 10;
  const nx = -dir.y;
  const ny = dir.x;
  const back = { x: point.x - dir.x * size, y: point.y - dir.y * size };
  const left = { x: back.x + nx * (size * 0.6), y: back.y + ny * (size * 0.6) };
  const right = { x: back.x - nx * (size * 0.6), y: back.y - ny * (size * 0.6) };
  return { tip: point, left, right, back };
};

export const resolveConnectorMode = (source: ConnectorEndpoint, target: ConnectorEndpoint) =>
  source.nodeId && target.nodeId ? "linked" : "free";
