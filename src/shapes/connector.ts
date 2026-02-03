import { Container, Graphics, Rectangle } from "pixi.js";
import type { ShapeHandler } from "./types";
import type { CanvasConnectorNode, CanvasState, Point } from "@/types/canvas";
import {
  buildArrowPath,
  buildPathPoints,
  getArrowDirection,
  getArrowStyle,
  getBoundsFromPoints,
  getConnectorPoints,
  getConnectorStyle,
  getEndpointPosition,
  hitTestLine
} from "./connector-utils";

const drawDashedPath = (graphics: Graphics, points: Point[], dash: number[]) => {
  if (points.length < 2) {
    return;
  }
  const pattern = dash.length >= 2 ? dash : [6, 6];
  let draw = true;
  let patternIndex = 0;
  let remaining = pattern[patternIndex];

  for (let i = 0; i < points.length - 1; i += 1) {
    let start = points[i];
    const end = points[i + 1];
    let dx = end.x - start.x;
    let dy = end.y - start.y;
    let segmentLen = Math.hypot(dx, dy);
    if (segmentLen === 0) {
      continue;
    }
    dx /= segmentLen;
    dy /= segmentLen;
    while (segmentLen > 0) {
      const step = Math.min(remaining, segmentLen);
      const next = { x: start.x + dx * step, y: start.y + dy * step };
      if (draw) {
        graphics.moveTo(start.x, start.y);
        graphics.lineTo(next.x, next.y);
      }
      segmentLen -= step;
      start = next;
      remaining -= step;
      if (remaining <= 0) {
        patternIndex = (patternIndex + 1) % pattern.length;
        remaining = pattern[patternIndex];
        draw = !draw;
      }
    }
  }
};

const drawArrow = (
  graphics: Graphics,
  point: Point,
  dir: Point,
  style: { type: "none" | "triangle" | "circle" | "diamond"; size: number; filled: boolean },
  strokeColor: number,
  strokeWidth: number,
  opacity: number
) => {
  if (style.type === "none") {
    return;
  }
  if (style.type === "circle") {
    graphics.lineStyle(strokeWidth, strokeColor, opacity);
    if (style.filled) {
      graphics.beginFill(strokeColor, opacity);
    }
    graphics.drawCircle(point.x, point.y, style.size / 2);
    if (style.filled) {
      graphics.endFill();
    }
    return;
  }
  const { tip, left, right, back } = buildArrowPath(point, dir, style);
  graphics.lineStyle(strokeWidth, strokeColor, opacity);
  if (style.filled) {
    graphics.beginFill(strokeColor, opacity);
  }
  graphics.moveTo(tip.x, tip.y);
  graphics.lineTo(left.x, left.y);
  if (style.type === "diamond") {
    graphics.lineTo(back.x, back.y);
  }
  graphics.lineTo(right.x, right.y);
  graphics.lineTo(tip.x, tip.y);
  if (style.filled) {
    graphics.endFill();
  }
};

export const connectorHandler: ShapeHandler<CanvasConnectorNode> = {
  render: (shape, ctx) => {
    const edgesLayer = ctx.layers?.edges;
    const viewCache = ctx.viewCache;
    const state = ctx.state as CanvasState | undefined;
    if (!(edgesLayer instanceof Container) || !(viewCache instanceof Map) || !state) {
      return;
    }

    const cached = viewCache.get(shape.id);
    const container = cached instanceof Container ? cached : new Container();
    container.eventMode = "static";
    container.cursor = "pointer";

    let graphics = container.children.find((child) => child instanceof Graphics) as
      | Graphics
      | undefined;
    if (!graphics) {
      graphics = new Graphics();
      container.addChild(graphics);
    }

    const { source, target, lineType } = getConnectorPoints(shape, state);
    const points = buildPathPoints(source, target, lineType);
    const bounds = getBoundsFromPoints(points);
    container.hitArea = new Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);

    const { strokeColor, strokeWidth, opacity, dash } = getConnectorStyle(shape.style);
    graphics.clear();
    graphics.lineStyle(strokeWidth, strokeColor, opacity);
    if (dash.length > 0) {
      drawDashedPath(graphics, points, dash);
    } else {
      graphics.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i += 1) {
        graphics.lineTo(points[i].x, points[i].y);
      }
    }

    const arrowStart = getArrowStyle(shape.style?.arrowStart);
    const arrowEnd = getArrowStyle(shape.style?.arrowEnd);
    const startDir = getArrowDirection(points, true);
    const endDir = getArrowDirection(points, false);
    drawArrow(graphics, points[0], startDir, arrowStart, strokeColor, strokeWidth, opacity);
    drawArrow(
      graphics,
      points[points.length - 1],
      endDir,
      arrowEnd,
      strokeColor,
      strokeWidth,
      opacity
    );

    if (container.parent !== edgesLayer) {
      edgesLayer.addChild(container);
    }
    viewCache.set(shape.id, container);
  },
  hitTest: (shape, point) => {
    const source = getEndpointPosition(shape.source);
    const target = getEndpointPosition(shape.target);
    const lineType = shape.style?.lineType ?? "curve";
    const points = buildPathPoints(source, target, lineType);
    const threshold = (shape.style?.strokeWidth ?? 2) + 4;
    return hitTestLine(point, points, threshold);
  },
  getBounds: (shape) => {
    const source = getEndpointPosition(shape.source);
    const target = getEndpointPosition(shape.target);
    const lineType = shape.style?.lineType ?? "curve";
    const points = buildPathPoints(source, target, lineType);
    return getBoundsFromPoints(points);
  }
};
