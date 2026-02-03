import type { GeometryShape, TextShape } from "../types";

const parseColor = (color: string) =>
  Number.parseInt(color.replace("#", "0x"), 16);

export const getGeometryStyle = (shape: GeometryShape) => {
  const fill = shape.style?.fill ?? "#ffffff";
  const stroke = shape.style?.stroke ?? "#475569";
  const strokeWidth = shape.style?.strokeWidth ?? 1;
  const opacity = shape.style?.opacity ?? 1;
  return {
    fill,
    stroke,
    strokeWidth,
    opacity,
    fillColor: parseColor(fill),
    strokeColor: parseColor(stroke)
  };
};

export const getTextStyle = (shape: TextShape) => {
  const content = shape.data?.text ?? "Text";
  const fontSize = shape.data?.fontSize ?? shape.style?.fontSize ?? 16;
  const fontFamily = shape.data?.fontFamily ?? shape.style?.fontFamily ?? "Inter";
  const fill = shape.style?.stroke ?? "#0f172a";
  return { content, fontSize, fontFamily, fill };
};
