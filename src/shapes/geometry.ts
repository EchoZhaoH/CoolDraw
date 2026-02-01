import { Container, Graphics } from "pixi.js";
import type { GeometryShape, Point, Rect, ShapeHandler } from "./types";

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
    const nodesLayer = ctx.layers?.nodes;
    const viewCache = ctx.viewCache;
    if (!(nodesLayer instanceof Container) || !(viewCache instanceof Map)) {
      return;
    }

    const container = new Container();
    container.position.set(shape.position.x, shape.position.y);
    container.eventMode = "static";
    container.cursor = "pointer";

    const body = new Graphics();
    const fill = shape.style?.fill ?? "#ffffff";
    const stroke = shape.style?.stroke ?? "#475569";
    const strokeWidth = shape.style?.strokeWidth ?? 1;
    const opacity = shape.style?.opacity ?? 1;
    const fillColor = Number.parseInt(fill.replace("#", "0x"), 16);
    const strokeColor = Number.parseInt(stroke.replace("#", "0x"), 16);

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
    container.addChild(body);
    nodesLayer.addChild(container);
    viewCache.set(shape.id, container);
  },
  hitTest: (shape, point) =>
    shape.kind === "ellipse"
      ? hitTestEllipse(shape, point)
      : hitTestRect(shape, point),
  getBounds,
  traits: {
    draggable: true,
    resizable: true,
    rotatable: true
  }
};
