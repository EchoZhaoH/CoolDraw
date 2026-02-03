import { Text } from "pixi.js";
import type { Point, Rect, ShapeHandler, TextShape } from "./types";
import { ensureNodeView } from "./render/nodeView";
import { getTextStyle } from "./render/style";

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
    const container = ensureNodeView(ctx, {
      id: shape.id,
      position: shape.position,
      size: shape.size,
      rotation: shape.rotation,
      cursor: "text"
    });
    if (!container) {
      return;
    }

    const { content, fontSize, fontFamily, fill } = getTextStyle(shape);

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
  },
  hitTest,
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
    textEditable: true
  }
};
