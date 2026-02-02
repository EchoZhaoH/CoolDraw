import type { Point, Viewport } from "@/types/canvas";

export const getNextViewportFromWheel = (
  viewport: Viewport,
  deltaY: number,
  anchor: Point
) => {
  const scaleStep = 0.0015;
  const nextScale = Math.min(
    4,
    Math.max(0.2, viewport.scale * (1 - deltaY * scaleStep))
  );
  const world = {
    x: (anchor.x - viewport.x) / viewport.scale,
    y: (anchor.y - viewport.y) / viewport.scale
  };
  const nextX = anchor.x - world.x * nextScale;
  const nextY = anchor.y - world.y * nextScale;
  return { x: nextX, y: nextY, scale: nextScale };
};
