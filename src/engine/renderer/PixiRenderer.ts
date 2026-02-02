import { Application, Container, Graphics } from "pixi.js";
import type { CanvasState } from "@/types/canvas";
import type { Renderer } from "@/engine/renderer/types";
import { getShapeHandler } from "@/shapes/registry";
import type { RenderContext } from "@/shapes/types";
import {
  getControlHandles,
  getHandleSize,
  getSelectionBounds,
  rotatePoint
} from "@/controls/utils";

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
    const prevIds = new Set(this.nodeViews.keys());
    const nextIds = new Set(state.nodes.map((node) => node.id));
    this.nodeViews.forEach((view, id) => {
      if (!nextIds.has(id)) {
        view.parent?.removeChild(view);
        view.destroy({ children: true });
        this.nodeViews.delete(id);
      }
    });
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
      if (view && !prevIds.has(node.id)) {
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
      overlay.beginFill(0x60a5fa, 0.12);
      overlay.drawRect(box.x, box.y, box.width, box.height);
      overlay.endFill();
    }

    if (state.selection.nodeIds.length > 0) {
      const selectedNodes = state.nodes.filter((node) =>
        state.selection.nodeIds.includes(node.id)
      );
      const boundsList = selectedNodes.map((node) => {
        const handler = getShapeHandler(node as never);
        return handler?.getBounds
          ? handler.getBounds(node as never)
          : {
              x: node.position.x,
              y: node.position.y,
              width: node.size.width,
              height: node.size.height
            };
      });
      const selectionBounds = getSelectionBounds(boundsList);
      if (selectionBounds) {
        const isSingle = state.selection.nodeIds.length === 1;
        const handleSize = getHandleSize(state.viewport.scale);
        const handles = getControlHandles(selectionBounds, handleSize, isSingle);
        const half = handleSize / 2;
        const padding = 4;
        const paddedBounds = {
          x: selectionBounds.x - padding,
          y: selectionBounds.y - padding,
          width: selectionBounds.width + padding * 2,
          height: selectionBounds.height + padding * 2
        };
        const center = {
          x: selectionBounds.x + selectionBounds.width / 2,
          y: selectionBounds.y + selectionBounds.height / 2
        };
        const rotation = isSingle ? selectedNodes[0]?.rotation ?? 0 : 0;

        overlay.lineStyle(2, 0x2563eb, 1);
        if (rotation !== 0) {
          const corners = [
            { x: paddedBounds.x, y: paddedBounds.y },
            { x: paddedBounds.x + paddedBounds.width, y: paddedBounds.y },
            {
              x: paddedBounds.x + paddedBounds.width,
              y: paddedBounds.y + paddedBounds.height
            },
            { x: paddedBounds.x, y: paddedBounds.y + paddedBounds.height }
          ].map((point) => rotatePoint(point, center, rotation));
          overlay.moveTo(corners[0].x, corners[0].y);
          overlay.lineTo(corners[1].x, corners[1].y);
          overlay.lineTo(corners[2].x, corners[2].y);
          overlay.lineTo(corners[3].x, corners[3].y);
          overlay.lineTo(corners[0].x, corners[0].y);
        } else {
          overlay.drawRect(
            paddedBounds.x,
            paddedBounds.y,
            paddedBounds.width,
            paddedBounds.height
          );
        }

        handles.forEach((handle) => {
          const position =
            rotation !== 0 ? rotatePoint(handle.position, center, rotation) : handle.position;
          if (handle.id === "rotate") {
            const anchor = rotatePoint(
              {
                x: selectionBounds.x + selectionBounds.width / 2,
                y: selectionBounds.y - handleSize * 1.2
              },
              center,
              rotation
            );
            overlay.lineStyle(1, 0x2563eb, 0.9);
            overlay.moveTo(anchor.x, anchor.y);
            overlay.lineTo(position.x, position.y);
            overlay.beginFill(0xffffff, 1);
            overlay.lineStyle(1.5, 0x2563eb, 1);
            overlay.drawCircle(position.x, position.y, half);
            overlay.endFill();
            return;
          }
          overlay.beginFill(0xffffff, 1);
          overlay.lineStyle(1.5, 0x2563eb, 1);
          overlay.drawRect(position.x - half, position.y - half, handleSize, handleSize);
          overlay.endFill();
        });
      }
    }

    this.overlayLayer.addChild(overlay);
  }
}
