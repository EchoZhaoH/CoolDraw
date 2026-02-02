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

    const cached = viewCache.get(shape.id);
    const container = cached instanceof Container ? cached : new Container();
    const rotation = shape.rotation ?? 0;
    const pivotX = shape.size.width / 2;
    const pivotY = shape.size.height / 2;
    container.pivot.set(pivotX, pivotY);
    container.position.set(shape.position.x + pivotX, shape.position.y + pivotY);
    container.rotation = rotation;
    container.eventMode = "static";
    container.cursor = "text";

    const content = shape.data?.text ?? "Text";
    const fontSize = shape.data?.fontSize ?? shape.style?.fontSize ?? 16;
    const fontFamily = shape.data?.fontFamily ?? shape.style?.fontFamily ?? "Inter";
    const fill = shape.style?.stroke ?? "#0f172a";

    let label = container.children.find((child) => child instanceof Text) as
      | Text
      | undefined;
    if (!label) {
      label = new Text(content, { fill, fontSize, fontFamily });
      container.addChild(label);
    } else {
      label.text = content;
      label.style = { fill, fontSize, fontFamily };
    }
    label.position.set(0, 0);

    if (container.parent !== nodesLayer) {
      nodesLayer.addChild(container);
    }
    viewCache.set(shape.id, container);
  },
  hitTest,
  getBounds,
  traits: {
    draggable: true,
    textEditable: true
  }
};
