import type { EnginePointerEvent } from "@/engine/events/types";
import { CanvasEngine } from "@/engine/CanvasEngine";
import { getRotationDelta, resizeBounds } from "@/controls/utils";
import {
  findAnchorAtPoint,
  getConnectorPoints,
  hitTestEndpoint,
  resolveConnectorMode
} from "@/shapes/connector-utils";
import { getControlHit } from "./controls";
import {
  getSelectedBounds,
  getNodeBounds,
  normalizeBox,
  intersects,
  screenToWorld
} from "./helpers";
import { mergeSelectionIds } from "./selection";
import { getNextViewportFromWheel } from "./viewport";
import type { BoardOptions, BoardStore } from "./types";

type DragSession = {
  active: boolean;
  start: { x: number; y: number };
  basePositions: Record<string, { x: number; y: number }>;
};

type PanSession = {
  active: boolean;
  start: { x: number; y: number };
  baseViewport: { x: number; y: number };
};

type ControlSession = {
  active: boolean;
  handleId: string;
  targetIds: string[];
  startPointer: { x: number; y: number };
  startBounds: { x: number; y: number; width: number; height: number };
  startRotation: number;
  baseNodes: Record<
    string,
    { position: { x: number; y: number }; size: { width: number; height: number }; rotation: number }
  >;
};

type ConnectorSession = {
  active: boolean;
  connectorId: string;
  endpointKey: "source" | "target";
  baseConnector: {
    source: { nodeId?: string; anchorId?: string; position?: { x: number; y: number } };
    target: { nodeId?: string; anchorId?: string; position?: { x: number; y: number } };
  };
};

export class Board {
  private container: HTMLElement;
  private store: BoardStore;
  private engine?: CanvasEngine;
  private unsubscribe?: () => void;
  private offDown?: () => void;
  private offMove?: () => void;
  private offUp?: () => void;

  private boxStart: { x: number; y: number } | null = null;
  private baseSelection: string[] = [];
  private dragSession: DragSession | null = null;
  private panSession: PanSession | null = null;
  private controlSession: ControlSession | null = null;
  private connectorSession: ConnectorSession | null = null;
  private spacePressed = false;

  constructor(options: BoardOptions) {
    this.container = options.container;
    this.store = options.store;
  }

  mount() {
    this.engine = new CanvasEngine(this.container);
    this.engine.setState(this.store.getState());
    this.unsubscribe = this.store.subscribe((state) =>
      this.engine?.setState(state)
    );

    this.container.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    this.offDown = this.engine.on("pointerDown", this.onPointerDown);
    this.offMove = this.engine.on("pointerMove", this.onPointerMove);
    this.offUp = this.engine.on("pointerUp", this.onPointerUp);
  }

  unmount() {
    this.container.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.offDown?.();
    this.offMove?.();
    this.offUp?.();
    this.unsubscribe?.();
    this.engine?.destroy();
    this.engine = undefined;
  }

  setState(state: Parameters<BoardStore["subscribe"]>[0] extends (s: infer S) => void ? S : never) {
    this.engine?.setState(state);
  }

  private getViewport = () => this.store.getState().viewport;

  private onPointerDown = (event: EnginePointerEvent) => {
    const viewport = this.getViewport();
    const isPanTrigger = this.spacePressed || event.button === 1;
    if (isPanTrigger) {
      this.panSession = {
        active: true,
        start: event.position,
        baseViewport: { x: viewport.x, y: viewport.y }
      };
      this.boxStart = null;
      this.baseSelection = [];
      this.dragSession = null;
      return;
    }

    const state = this.store.getState();
    const worldPosition = screenToWorld(viewport, event.position);
    const currentSelection = state.selection.nodeIds;
    if (currentSelection.length > 0) {
      const hasConnector = state.nodes.some(
        (node) => currentSelection.includes(node.id) && node.type === "connector"
      );
      const selectionBounds = getSelectedBounds(state, currentSelection);
      if (selectionBounds) {
        if (!hasConnector) {
          const hit = getControlHit(
            worldPosition,
            selectionBounds,
            currentSelection,
            state.nodes,
            viewport.scale
          );
          if (hit) {
            const baseNodes: ControlSession["baseNodes"] = {};
            state.nodes.forEach((node) => {
              if (currentSelection.includes(node.id)) {
                baseNodes[node.id] = {
                  position: { ...node.position },
                  size: { ...node.size },
                  rotation: node.rotation ?? 0
                };
              }
            });
            const singleRotation =
              currentSelection.length === 1
                ? baseNodes[currentSelection[0]].rotation
                : 0;
            this.controlSession = {
              active: true,
              handleId: hit.hit.id,
              targetIds: currentSelection,
              startPointer: worldPosition,
              startBounds: selectionBounds,
              startRotation: singleRotation,
              baseNodes
            };
            return;
          }
        }
      }
    }

    if (event.targetId) {
      const targetNode = state.nodes.find((node) => node.id === event.targetId);
      if (targetNode?.type === "connector") {
        const { source, target } = getConnectorPoints(targetNode, state);
        const hitRadius = 8 / viewport.scale;
        const endpointKey = hitTestEndpoint(worldPosition, source, target, hitRadius);
        if (endpointKey) {
          this.store.actions.setSelection({
            nodeIds: [targetNode.id],
            edgeIds: [],
            groupIds: [],
            mode: "single",
            box: undefined
          });
          this.connectorSession = {
            active: true,
            connectorId: targetNode.id,
            endpointKey,
            baseConnector: {
              source: { ...targetNode.source },
              target: { ...targetNode.target }
            }
          };
          return;
        }
        this.store.actions.setSelection({
          nodeIds: [targetNode.id],
          edgeIds: [],
          groupIds: [],
          mode: "single",
          box: undefined
        });
        return;
      }
      if (event.shiftKey) {
        this.store.actions.toggleSelection(event.targetId);
        this.boxStart = null;
        this.baseSelection = [];
        this.dragSession = null;
        return;
      }

      const current = this.store.getState();
      const isSelected = current.selection.nodeIds.includes(event.targetId);
      const selectedIds = isSelected ? current.selection.nodeIds : [event.targetId];

      if (!isSelected) {
        this.store.actions.setSelection({
          nodeIds: selectedIds,
          edgeIds: [],
          groupIds: [],
          mode: "single",
          box: undefined
        });
      }

      const basePositions: Record<string, { x: number; y: number }> = {};
      current.nodes.forEach((node) => {
        if (selectedIds.includes(node.id)) {
          basePositions[node.id] = { ...node.position };
        }
      });

      this.dragSession = {
        active: true,
        start: worldPosition,
        basePositions
      };
      this.boxStart = null;
      this.baseSelection = [];
      return;
    }

    this.dragSession = null;
    const existing = this.store.getState().selection.nodeIds;
    this.baseSelection = event.shiftKey ? existing : [];
    this.boxStart = worldPosition;
    this.store.actions.setSelection({
      nodeIds: this.baseSelection,
      edgeIds: [],
      groupIds: [],
      mode: "multi",
      box: { x: worldPosition.x, y: worldPosition.y, width: 0, height: 0 }
    });
  };

  private onPointerMove = (event: EnginePointerEvent) => {
    if (this.controlSession?.active) {
      const session = this.controlSession;
      const viewport = this.getViewport();
      const worldPosition = screenToWorld(viewport, event.position);
      if (session.handleId === "rotate") {
        const center = {
          x: session.startBounds.x + session.startBounds.width / 2,
          y: session.startBounds.y + session.startBounds.height / 2
        };
        const delta = getRotationDelta(center, session.startPointer, worldPosition);
        const id = session.targetIds[0];
        const base = session.baseNodes[id];
        this.store.actions.updateNodesTransformPreview([
          { id, rotation: base.rotation + delta }
        ]);
        return;
      }
      const nextBounds = resizeBounds(
        session.startBounds,
        session.handleId as never,
        session.startPointer,
        worldPosition
      );
      const sx = nextBounds.width / session.startBounds.width;
      const sy = nextBounds.height / session.startBounds.height;
      const updates = session.targetIds.map((id) => {
        const base = session.baseNodes[id];
        const dx = base.position.x - session.startBounds.x;
        const dy = base.position.y - session.startBounds.y;
        return {
          id,
          position: {
            x: nextBounds.x + dx * sx,
            y: nextBounds.y + dy * sy
          },
          size: {
            width: base.size.width * sx,
            height: base.size.height * sy
          },
          rotation: base.rotation
        };
      });
      this.store.actions.updateNodesTransformPreview(updates);
      return;
    }

    if (this.connectorSession?.active) {
      const session = this.connectorSession;
      const viewport = this.getViewport();
      const worldPosition = screenToWorld(viewport, event.position);
      const state = this.store.getState();
      const anchorHit = findAnchorAtPoint(state, worldPosition, 8 / viewport.scale);
      const endpoint =
        anchorHit
          ? { nodeId: anchorHit.nodeId, anchorId: anchorHit.anchorId }
          : { position: worldPosition };
      const nextSource =
        session.endpointKey === "source" ? endpoint : session.baseConnector.source;
      const nextTarget =
        session.endpointKey === "target" ? endpoint : session.baseConnector.target;
      this.store.actions.updateNodePreview(session.connectorId, {
        source: nextSource,
        target: nextTarget,
        mode: resolveConnectorMode(nextSource, nextTarget)
      });
      return;
    }

    if (this.panSession?.active) {
      const { start, baseViewport } = this.panSession;
      const dx = event.position.x - start.x;
      const dy = event.position.y - start.y;
      this.store.actions.setViewport({
        x: baseViewport.x + dx,
        y: baseViewport.y + dy,
        scale: this.getViewport().scale
      });
      return;
    }

    if (this.dragSession?.active) {
      const { start, basePositions } = this.dragSession;
      const viewport = this.getViewport();
      const worldPosition = screenToWorld(viewport, event.position);
      const dx = worldPosition.x - start.x;
      const dy = worldPosition.y - start.y;
      const updates = Object.entries(basePositions).map(([id, pos]) => ({
        id,
        x: pos.x + dx,
        y: pos.y + dy
      }));
      this.store.actions.updateNodesPositionPreview(updates);
      return;
    }

    if (!this.boxStart) {
      return;
    }
    const viewport = this.getViewport();
    const worldPosition = screenToWorld(viewport, event.position);
    const box = normalizeBox(this.boxStart, worldPosition);
    this.store.actions.setSelectionBox(box);
  };

  private onPointerUp = (event: EnginePointerEvent) => {
    if (this.panSession?.active) {
      this.panSession = null;
      return;
    }

    if (this.controlSession?.active) {
      const session = this.controlSession;
      const viewport = this.getViewport();
      const worldPosition = screenToWorld(viewport, event.position);
      if (session.handleId === "rotate") {
        const center = {
          x: session.startBounds.x + session.startBounds.width / 2,
          y: session.startBounds.y + session.startBounds.height / 2
        };
        const delta = getRotationDelta(center, session.startPointer, worldPosition);
        const id = session.targetIds[0];
        const base = session.baseNodes[id];
        this.store.actions.updateNodesTransformCommit([
          { id, rotation: base.rotation + delta }
        ]);
      } else {
        const nextBounds = resizeBounds(
          session.startBounds,
          session.handleId as never,
          session.startPointer,
          worldPosition
        );
        const sx = nextBounds.width / session.startBounds.width;
        const sy = nextBounds.height / session.startBounds.height;
        const updates = session.targetIds.map((id) => {
          const base = session.baseNodes[id];
          const dx = base.position.x - session.startBounds.x;
          const dy = base.position.y - session.startBounds.y;
          return {
            id,
            position: {
              x: nextBounds.x + dx * sx,
              y: nextBounds.y + dy * sy
            },
            size: {
              width: base.size.width * sx,
              height: base.size.height * sy
            },
            rotation: base.rotation
          };
        });
        this.store.actions.updateNodesTransformCommit(updates);
      }
      this.controlSession = null;
      return;
    }

    if (this.connectorSession?.active) {
      const session = this.connectorSession;
      const viewport = this.getViewport();
      const worldPosition = screenToWorld(viewport, event.position);
      const state = this.store.getState();
      const anchorHit = findAnchorAtPoint(state, worldPosition, 8 / viewport.scale);
      const endpoint =
        anchorHit
          ? { nodeId: anchorHit.nodeId, anchorId: anchorHit.anchorId }
          : { position: worldPosition };
      const nextSource =
        session.endpointKey === "source" ? endpoint : session.baseConnector.source;
      const nextTarget =
        session.endpointKey === "target" ? endpoint : session.baseConnector.target;
      this.store.actions.updateNode(session.connectorId, {
        source: nextSource,
        target: nextTarget,
        mode: resolveConnectorMode(nextSource, nextTarget)
      });
      this.connectorSession = null;
      return;
    }

    if (this.dragSession?.active) {
      const { start, basePositions } = this.dragSession;
      const viewport = this.getViewport();
      const worldPosition = screenToWorld(viewport, event.position);
      const dx = worldPosition.x - start.x;
      const dy = worldPosition.y - start.y;
      const updates = Object.entries(basePositions).map(([id, pos]) => ({
        id,
        x: pos.x + dx,
        y: pos.y + dy
      }));
      this.store.actions.updateNodesPosition(updates);
      this.dragSession = null;
      return;
    }

    if (!this.boxStart) {
      return;
    }
    const viewport = this.getViewport();
    const worldPosition = screenToWorld(viewport, event.position);
    const box = normalizeBox(this.boxStart, worldPosition);
    const clickThreshold = 3 / viewport.scale;
    const isClick = box.width < clickThreshold && box.height < clickThreshold;
    if (isClick && this.baseSelection.length === 0) {
      this.store.actions.clearSelection();
    } else {
      const nodes = this.store.getState().nodes;
      const hitIds = nodes
        .filter((node) => intersects(box, getNodeBounds(this.store.getState(), node)))
        .map((node) => node.id);
      const merged = mergeSelectionIds(this.baseSelection, hitIds);
      this.store.actions.setSelection({
        nodeIds: merged,
        edgeIds: [],
        groupIds: [],
        mode: merged.length > 1 ? "multi" : "single",
        box: undefined
      });
    }
    this.boxStart = null;
    this.baseSelection = [];
    this.store.actions.clearSelectionBox();
  };

  private onWheel = (event: WheelEvent) => {
    event.preventDefault();
    const viewport = this.getViewport();
    const rect = this.container.getBoundingClientRect();
    const anchor = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const nextViewport = getNextViewportFromWheel(viewport, event.deltaY, anchor);
    this.store.actions.setViewport(nextViewport);
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Space") {
      this.spacePressed = true;
    }
  };

  private onKeyUp = (event: KeyboardEvent) => {
    if (event.code === "Space") {
      this.spacePressed = false;
    }
  };
}
