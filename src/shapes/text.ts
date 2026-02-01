import { Container, Text } from "pixi.js";
import type { Point, Rect, ShapeHandler, TextShape } from "./types";

const getBounds = (shape: TextShape): Rect => ({
  x: shape.position.x,
  y: shape.position.y,
  width: shape.size.width,
  height: shape.size.height
});

const hitTest = (shape: TextShape, point: Point) => {
  const bounds = getBounds(shape);
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
};

export const textHandler: ShapeHandler<TextShape> = {
  render: (shape, ctx) => {
    const nodesLayer = ctx.layers?.nodes;
    const viewCache = ctx.viewCache;
    if (!(nodesLayer instanceof Container) || !(viewCache instanceof Map)) {
      return;
    }

    const container = new Container();
    container.position.set(shape.position.x, shape.position.y);
    container.eventMode = "static";
    container.cursor = "text";

    const content = shape.data?.text ?? "Text";
    const fontSize = shape.data?.fontSize ?? shape.style?.fontSize ?? 16;
    const fontFamily = shape.data?.fontFamily ?? shape.style?.fontFamily ?? "Inter";

    const label = new Text(content, {
      fill: shape.style?.stroke ?? "#0f172a",
      fontSize,
      fontFamily
    });
    label.position.set(0, 0);

    container.addChild(label);
    nodesLayer.addChild(container);
    viewCache.set(shape.id, container);
  },
  hitTest,
  getBounds,
  traits: {
    draggable: true,
    textEditable: true
  }
};
