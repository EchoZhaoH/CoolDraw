import { Graphics } from "pixi.js";
import type { GeometryShape, Point, Rect, ShapeHandler } from "./types";
import { ensureNodeView } from "./render/nodeView";
import { getGeometryStyle } from "./render/style";

const getBounds = (shape: GeometryShape): Rect => ({
  x: shape.position.x,
  y: shape.position.y,
  width: shape.size.width,
  height: shape.size.height
});

const hitTestRect = (shape: GeometryShape, point: Point) => {
  const bounds = getBounds(shape);
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
};

const hitTestEllipse = (shape: GeometryShape, point: Point) => {
  const bounds = getBounds(shape);
  const rx = bounds.width / 2;
  const ry = bounds.height / 2;
  const cx = bounds.x + rx;
  const cy = bounds.y + ry;
  if (rx === 0 || ry === 0) {
    return false;
  }
  const dx = (point.x - cx) / rx;
  const dy = (point.y - cy) / ry;
  return dx * dx + dy * dy <= 1;
};

export const geometryHandler: ShapeHandler<GeometryShape> = {
  render: (shape, ctx) => {
    const container = ensureNodeView(ctx, {
      id: shape.id,
      position: shape.position,
      size: shape.size,
      rotation: shape.rotation,
      cursor: "pointer"
    });
    if (!container) {
      return;
    }

    let body = container.children.find((child) => child instanceof Graphics) as
      | Graphics
      | undefined;
    if (!body) {
      body = new Graphics();
      container.addChild(body);
    }

    const { fillColor, strokeColor, strokeWidth, opacity } =
      getGeometryStyle(shape);

    body.clear();
    body.lineStyle(strokeWidth, strokeColor, opacity);
    body.beginFill(fillColor, opacity);

    if ((shape.kind ?? "rect") === "ellipse") {
      body.drawEllipse(
        shape.size.width / 2,
        shape.size.height / 2,
        shape.size.width / 2,
        shape.size.height / 2
      );
    } else {
      const radius = shape.style?.cornerRadius ?? 8;
      body.drawRoundedRect(0, 0, shape.size.width, shape.size.height, radius);
    }

    body.endFill();
  },
  hitTest: (shape, point) =>
    shape.kind === "ellipse"
      ? hitTestEllipse(shape, point)
      : hitTestRect(shape, point),
  getBounds,
  getAnchors: (shape) => {
    const bounds = getBounds(shape);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    return [
      { id: "c", position: { x: cx, y: cy } },
      { id: "n", position: { x: cx, y: bounds.y } },
      { id: "e", position: { x: bounds.x + bounds.width, y: cy } },
      { id: "s", position: { x: cx, y: bounds.y + bounds.height } },
      { id: "w", position: { x: bounds.x, y: cy } }
    ];
  },
  traits: {
    draggable: true,
    resizable: true,
    rotatable: true
  }
};
