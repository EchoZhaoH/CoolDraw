import type { CanvasNode, Point, Rect } from "@/types/canvas";
import type { ControlHandle } from "@/controls/types";
import {
  getControlHandles,
  getHandleSize,
  hitTestHandle,
  rotatePoint
} from "@/controls/utils";

export const getControlHit = (
  point: Point,
  selectionBounds: Rect,
  selectionIds: string[],
  nodes: CanvasNode[],
  viewportScale: number
) => {
  const isSingle = selectionIds.length === 1;
  const handleSize = getHandleSize(viewportScale);
  const handles = getControlHandles(selectionBounds, handleSize, isSingle);
  const rotation = isSingle
    ? nodes.find((node) => node.id === selectionIds[0])?.rotation ?? 0
    : 0;
  const center = {
    x: selectionBounds.x + selectionBounds.width / 2,
    y: selectionBounds.y + selectionBounds.height / 2
  };
  const rotatedHandles: ControlHandle[] =
    rotation !== 0
      ? handles.map((handle) => ({
          ...handle,
          position: rotatePoint(handle.position, center, rotation)
        }))
      : handles;
  const hit = hitTestHandle(point, rotatedHandles, handleSize);

  return hit
    ? { hit, rotation, center, handles, handleSize, isSingle }
    : null;
};
