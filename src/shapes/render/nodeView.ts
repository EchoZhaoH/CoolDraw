import { Container } from "pixi.js";
import type { RenderContext } from "../types";

type NodeViewOptions = {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation?: number;
  cursor: string;
};

export const ensureNodeView = (
  ctx: RenderContext,
  options: NodeViewOptions
): Container | null => {
  const nodesLayer = ctx.layers?.nodes;
  const viewCache = ctx.viewCache;
  if (!(nodesLayer instanceof Container) || !(viewCache instanceof Map)) {
    return null;
  }

  const cached = viewCache.get(options.id);
  const container = cached instanceof Container ? cached : new Container();
  const pivotX = options.size.width / 2;
  const pivotY = options.size.height / 2;
  container.pivot.set(pivotX, pivotY);
  container.position.set(options.position.x + pivotX, options.position.y + pivotY);
  container.rotation = options.rotation ?? 0;
  container.eventMode = "static";
  container.cursor = options.cursor;

  if (container.parent !== nodesLayer) {
    nodesLayer.addChild(container);
  }
  viewCache.set(options.id, container);
  return container;
};
