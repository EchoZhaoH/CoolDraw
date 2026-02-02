import type { Point, Rect } from "@/types/canvas";
import type { ControlHandle, ControlHandleId } from "./types";

const cursorMap: Record<ControlHandleId, string> = {
  nw: "nwse-resize",
  n: "ns-resize",
  ne: "nesw-resize",
  e: "ew-resize",
  se: "nwse-resize",
  s: "ns-resize",
  sw: "nesw-resize",
  w: "ew-resize",
  rotate: "grab"
};

export const getHandleSize = (scale: number) => Math.max(6, 10 / scale);

export const getSelectionBounds = (bounds: Rect[]) => {
  if (bounds.length === 0) {
    return null;
  }
  const first = bounds[0];
  let minX = first.x;
  let minY = first.y;
  let maxX = first.x + first.width;
  let maxY = first.y + first.height;
  bounds.slice(1).forEach((rect) => {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  });
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

export const getControlHandles = (
  bounds: Rect,
  handleSize: number,
  includeRotate: boolean
): ControlHandle[] => {
  const { x, y, width, height } = bounds;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rotateOffset = handleSize * 2.2;

  const handles: ControlHandle[] = [
    { id: "nw", type: "scale", position: { x, y }, cursor: cursorMap.nw },
    { id: "n", type: "scale", position: { x: cx, y }, cursor: cursorMap.n },
    { id: "ne", type: "scale", position: { x: x + width, y }, cursor: cursorMap.ne },
    { id: "e", type: "scale", position: { x: x + width, y: cy }, cursor: cursorMap.e },
    {
      id: "se",
      type: "scale",
      position: { x: x + width, y: y + height },
      cursor: cursorMap.se
    },
    { id: "s", type: "scale", position: { x: cx, y: y + height }, cursor: cursorMap.s },
    { id: "sw", type: "scale", position: { x, y: y + height }, cursor: cursorMap.sw },
    { id: "w", type: "scale", position: { x, y: cy }, cursor: cursorMap.w }
  ];

  if (includeRotate) {
    handles.push({
      id: "rotate",
      type: "rotate",
      position: { x: cx, y: y - rotateOffset },
      cursor: cursorMap.rotate
    });
  }

  return handles;
};

export const hitTestHandle = (
  point: Point,
  handles: ControlHandle[],
  handleSize: number
) => {
  const half = handleSize / 2;
  return handles.find((handle) => {
    const dx = point.x - handle.position.x;
    const dy = point.y - handle.position.y;
    if (handle.id === "rotate") {
      return dx * dx + dy * dy <= half * half;
    }
    return (
      point.x >= handle.position.x - half &&
      point.x <= handle.position.x + half &&
      point.y >= handle.position.y - half &&
      point.y <= handle.position.y + half
    );
  });
};

export const resizeBounds = (
  start: Rect,
  handleId: ControlHandleId,
  startPointer: Point,
  currentPointer: Point,
  minSize = 20
) => {
  if (handleId === "rotate") {
    return start;
  }
  const dx = currentPointer.x - startPointer.x;
  const dy = currentPointer.y - startPointer.y;
  let { x, y, width, height } = start;

  const isWest = handleId.includes("w");
  const isEast = handleId.includes("e");
  const isNorth = handleId.includes("n");
  const isSouth = handleId.includes("s");

  if (isEast) {
    width = start.width + dx;
  }
  if (isWest) {
    width = start.width - dx;
    x = start.x + dx;
  }
  if (width < minSize) {
    width = minSize;
    if (isWest) {
      x = start.x + (start.width - minSize);
    }
  }

  if (isSouth) {
    height = start.height + dy;
  }
  if (isNorth) {
    height = start.height - dy;
    y = start.y + dy;
  }
  if (height < minSize) {
    height = minSize;
    if (isNorth) {
      y = start.y + (start.height - minSize);
    }
  }

  return { x, y, width, height };
};

export const getRotationDelta = (center: Point, from: Point, to: Point) => {
  const start = Math.atan2(from.y - center.y, from.x - center.x);
  const next = Math.atan2(to.y - center.y, to.x - center.x);
  return next - start;
};

export const rotatePoint = (point: Point, center: Point, angle: number): Point => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos
  };
};
