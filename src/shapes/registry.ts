import type { BaseShape, ShapeHandler } from "./types";
import { geometryHandler } from "./geometry";
import { textHandler } from "./text";
import { connectorHandler } from "./connector";

export type ShapeRegistry = Map<string, ShapeHandler<BaseShape>>;

const registry: ShapeRegistry = new Map([
  ["geometry", geometryHandler as ShapeHandler<BaseShape>],
  ["text", textHandler as ShapeHandler<BaseShape>],
  ["connector", connectorHandler as ShapeHandler<BaseShape>]
]);

export const registerShape = (type: string, handler: ShapeHandler) => {
  registry.set(type, handler);
};

export const getShapeHandler = (shape: BaseShape) =>
  registry.get(shape.type);

export const getShapeRegistry = () => registry;
