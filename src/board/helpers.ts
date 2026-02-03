import type { CanvasNode, CanvasState, Point, Rect, Selection, Viewport } from "@/types/canvas";
import { getShapeHandler } from "@/shapes/registry";
import { getSelectionBounds as mergeSelectionBounds } from "@/controls/utils";
import { buildPathPoints, getBoundsFromPoints, getConnectorPoints } from "@/shapes/connector-utils";

export const screenToWorld = (viewport: Viewport, point: Point) => ({
  x: (point.x - viewport.x) / viewport.scale,
  y: (point.y - viewport.y) / viewport.scale
});

export const getNodeBounds = (state: CanvasState, node: CanvasNode): Rect => {
  if (node.type === "connector") {
    const { source, target, lineType } = getConnectorPoints(node as never, state);
    const points = buildPathPoints(source, target, lineType);
    return getBoundsFromPoints(points);
  }
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

export const getSelectedBounds = (state: CanvasState, nodeIds: string[]) => {
  const nodes = state.nodes.filter((node) => nodeIds.includes(node.id));
  const boundsList = nodes.map((node) => getNodeBounds(state, node));
  return mergeSelectionBounds(boundsList);
};

export const normalizeBox = (start: Point, end: Point) => {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  return { x, y, width, height };
};

export const intersects = (
  box: Selection["box"],
  bounds: Rect
) => {
  if (!box) {
    return false;
  }
  return !(
    bounds.x > box.x + box.width ||
    bounds.x + bounds.width < box.x ||
    bounds.y > box.y + box.height ||
    bounds.y + bounds.height < box.y
  );
};
