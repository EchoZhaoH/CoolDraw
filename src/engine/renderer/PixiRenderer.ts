import { Application, Container, Graphics } from "pixi.js";
import type { CanvasState } from "@/types/canvas";
import type { Renderer } from "@/engine/renderer/types";
import { getShapeHandler } from "@/shapes/registry";
import type { RenderContext } from "@/shapes/types";

type NodeView = Container;

export class PixiRenderer implements Renderer {
  private app: Application;
  private container: HTMLElement;
  private worldContainer: Container;
  private nodesLayer: Container;
  private edgesLayer: Container;
  private overlayLayer: Container;
  private nodeViews = new Map<string, NodeView>();
  private onNodeMounted?: (id: string, view: NodeView) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.app = new Application({
      resizeTo: container,
      backgroundAlpha: 0,
      antialias: true
    });
    this.worldContainer = new Container();
    this.nodesLayer = new Container();
    this.edgesLayer = new Container();
    this.overlayLayer = new Container();
    this.worldContainer.addChild(this.edgesLayer, this.nodesLayer, this.overlayLayer);
    this.app.stage.addChild(this.worldContainer);
    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;
    this.container.appendChild(this.app.view as HTMLCanvasElement);
  }

  render(state: CanvasState) {
    this.worldContainer.position.set(state.viewport.x, state.viewport.y);
    this.worldContainer.scale.set(state.viewport.scale, state.viewport.scale);
    this.renderEdges(state);
    this.renderNodes(state);
    this.renderOverlay(state);
  }

  destroy() {
    this.app.destroy(true, { children: true });
    this.nodeViews.clear();
  }

  getStage() {
    return this.app.stage;
  }

  getApp() {
    return this.app;
  }

  setNodeMountedHandler(handler?: (id: string, view: NodeView) => void) {
    this.onNodeMounted = handler;
  }

  private renderNodes(state: CanvasState) {
    this.nodesLayer.removeChildren();
    this.nodeViews.clear();
    const renderContext: RenderContext = {
      stage: this.app.stage,
      layers: {
        nodes: this.nodesLayer,
        edges: this.edgesLayer,
        overlay: this.overlayLayer
      },
      viewCache: this.nodeViews
    };

    state.nodes.forEach((node) => {
      const handler = getShapeHandler(node as never);
      if (!handler) {
        return;
      }
      handler.render(node as never, renderContext);
      const view = this.nodeViews.get(node.id);
      if (view) {
        this.onNodeMounted?.(node.id, view);
      }
    });
  }

  private renderEdges(state: CanvasState) {
    this.edgesLayer.removeChildren();
    const nodeMap = new Map(state.nodes.map((node) => [node.id, node]));

    state.edges.forEach((edge) => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) {
        return;
      }

      const line = new Graphics();
      line.lineStyle(2, 0x94a3b8, 0.8);
      line.moveTo(
        source.position.x + source.size.width / 2,
        source.position.y + source.size.height / 2
      );
      line.lineTo(
        target.position.x + target.size.width / 2,
        target.position.y + target.size.height / 2
      );
      this.edgesLayer.addChild(line);
    });
  }

  private renderOverlay(state: CanvasState) {
    this.overlayLayer.removeChildren();
    const overlay = new Graphics();

    const box = state.selection.box;
    if (box) {
      overlay.lineStyle(1, 0x3b82f6, 0.9);
      overlay.beginFill(0x93c5fd, 0.15);
      overlay.drawRect(box.x, box.y, box.width, box.height);
      overlay.endFill();
    }

    if (state.selection.nodeIds.length > 0) {
      state.nodes.forEach((node) => {
        if (!state.selection.nodeIds.includes(node.id)) {
          return;
        }
        const handler = getShapeHandler(node as never);
        const bounds = handler?.getBounds
          ? handler.getBounds(node as never)
          : {
              x: node.position.x,
              y: node.position.y,
              width: node.size.width,
              height: node.size.height
            };
        overlay.lineStyle(2, 0x2563eb, 0.9);
        overlay.drawRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
      });
    }

    this.overlayLayer.addChild(overlay);
  }
}
