import { useEffect, useRef } from "react";
import { CanvasEngine } from "@/engine/CanvasEngine";
import { canvasStore } from "@/store/canvasStore";
import { getShapeHandler } from "@/shapes/registry";
import type { CanvasNode, Selection } from "@/types/canvas";

const CanvasRoot = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boxStartRef = useRef<{ x: number; y: number } | null>(null);
  const baseSelectionRef = useRef<string[]>([]);
  const dragSessionRef = useRef<{
    active: boolean;
    start: { x: number; y: number };
    basePositions: Record<string, { x: number; y: number }>;
  } | null>(null);
  const panSessionRef = useRef<{
    active: boolean;
    start: { x: number; y: number };
    baseViewport: { x: number; y: number };
  } | null>(null);
  const spacePressedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const engine = new CanvasEngine(containerRef.current);
    engine.setState(canvasStore.getState());
    const unsubscribe = canvasStore.subscribe((state) => engine.setState(state));

    const getViewport = () => canvasStore.getState().viewport;

    const screenToWorld = (point: { x: number; y: number }) => {
      const viewport = getViewport();
      return {
        x: (point.x - viewport.x) / viewport.scale,
        y: (point.y - viewport.y) / viewport.scale
      };
    };

    const getBounds = (node: CanvasNode) => {
      const handler = getShapeHandler(node as never);
      if (handler?.getBounds) {
        return handler.getBounds(node as never);
      }
      return {
        x: node.position.x,
        y: node.position.y,
        width: node.size.width,
        height: node.size.height
      };
    };

    const normalizeBox = (
      start: { x: number; y: number },
      end: { x: number; y: number }
    ) => {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      return { x, y, width, height };
    };

    const intersects = (box: Selection["box"], bounds: ReturnType<typeof getBounds>) => {
      if (!box) {
        return false;
      }
      return !(
        bounds.x > box.x + box.width ||
        bounds.x + bounds.width < box.x ||
        bounds.y > box.y + box.height ||
        bounds.y + bounds.height < box.y
      );
    };

    const setSelection = (patch: Partial<Selection>) => {
      const current = canvasStore.getState().selection;
      canvasStore.actions.setSelection({ ...current, ...patch });
    };

    const onPointerDown = (event: {
      targetId?: string;
      position: { x: number; y: number };
      shiftKey?: boolean;
      button?: number;
    }) => {
      const viewport = getViewport();
      const isPanTrigger = spacePressedRef.current || event.button === 1;
      if (isPanTrigger) {
        panSessionRef.current = {
          active: true,
          start: event.position,
          baseViewport: { x: viewport.x, y: viewport.y }
        };
        boxStartRef.current = null;
        baseSelectionRef.current = [];
        dragSessionRef.current = null;
        return;
      }

      const worldPosition = screenToWorld(event.position);
      if (event.targetId) {
        if (event.shiftKey) {
          canvasStore.actions.toggleSelection(event.targetId);
          boxStartRef.current = null;
          baseSelectionRef.current = [];
          dragSessionRef.current = null;
          return;
        }

        const current = canvasStore.getState();
        const isSelected = current.selection.nodeIds.includes(event.targetId);
        const selectedIds = isSelected
          ? current.selection.nodeIds
          : [event.targetId];

        if (!isSelected) {
          canvasStore.actions.setSelection({
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

        dragSessionRef.current = {
          active: true,
          start: worldPosition,
          basePositions
        };
        boxStartRef.current = null;
        baseSelectionRef.current = [];
        return;
      }

      dragSessionRef.current = null;
      const existing = canvasStore.getState().selection.nodeIds;
      baseSelectionRef.current = event.shiftKey ? existing : [];
      boxStartRef.current = worldPosition;
      setSelection({
        nodeIds: baseSelectionRef.current,
        edgeIds: [],
        groupIds: [],
        mode: "multi",
        box: { x: worldPosition.x, y: worldPosition.y, width: 0, height: 0 }
      });
    };

    const onPointerMove = (event: { position: { x: number; y: number } }) => {
      if (panSessionRef.current?.active) {
        const { start, baseViewport } = panSessionRef.current;
        const dx = event.position.x - start.x;
        const dy = event.position.y - start.y;
        canvasStore.actions.setViewport({
          x: baseViewport.x + dx,
          y: baseViewport.y + dy,
          scale: getViewport().scale
        });
        return;
      }
      if (dragSessionRef.current?.active) {
        const { start, basePositions } = dragSessionRef.current;
        const worldPosition = screenToWorld(event.position);
        const dx = worldPosition.x - start.x;
        const dy = worldPosition.y - start.y;
        const updates = Object.entries(basePositions).map(([id, pos]) => ({
          id,
          x: pos.x + dx,
          y: pos.y + dy
        }));
        canvasStore.actions.updateNodesPosition(updates);
        return;
      }
      if (!boxStartRef.current) {
        return;
      }
      const worldPosition = screenToWorld(event.position);
      const box = normalizeBox(boxStartRef.current, worldPosition);
      canvasStore.actions.setSelectionBox(box);
    };

    const onPointerUp = (event: { position: { x: number; y: number } }) => {
      if (panSessionRef.current?.active) {
        panSessionRef.current = null;
        return;
      }
      if (dragSessionRef.current?.active) {
        dragSessionRef.current = null;
        return;
      }
      if (!boxStartRef.current) {
        return;
      }
      const worldPosition = screenToWorld(event.position);
      const box = normalizeBox(boxStartRef.current, worldPosition);
      const clickThreshold = 3 / getViewport().scale;
      const isClick = box.width < clickThreshold && box.height < clickThreshold;
      if (isClick && baseSelectionRef.current.length === 0) {
        canvasStore.actions.clearSelection();
      } else {
        const nodes = canvasStore.getState().nodes;
        const hitIds = nodes
          .filter((node) => intersects(box, getBounds(node)))
          .map((node) => node.id);
        const merged = Array.from(
          new Set([...baseSelectionRef.current, ...hitIds])
        );
        canvasStore.actions.setSelection({
          nodeIds: merged,
          edgeIds: [],
          groupIds: [],
          mode: merged.length > 1 ? "multi" : "single",
          box: undefined
        });
      }
      boxStartRef.current = null;
      baseSelectionRef.current = [];
      canvasStore.actions.clearSelectionBox();
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const viewport = getViewport();
      const scaleStep = 0.0015;
      const nextScale = Math.min(
        4,
        Math.max(0.2, viewport.scale * (1 - event.deltaY * scaleStep))
      );
      const rect = container.getBoundingClientRect();
      const anchor = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const world = {
        x: (anchor.x - viewport.x) / viewport.scale,
        y: (anchor.y - viewport.y) / viewport.scale
      };
      const nextX = anchor.x - world.x * nextScale;
      const nextY = anchor.y - world.y * nextScale;
      canvasStore.actions.setViewport({ x: nextX, y: nextY, scale: nextScale });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        spacePressedRef.current = true;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        spacePressedRef.current = false;
      }
    };

    const container = containerRef.current;
    container.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const offDown = engine.on("pointerDown", onPointerDown);
    const offMove = engine.on("pointerMove", onPointerMove);
    const offUp = engine.on("pointerUp", onPointerUp);

    return () => {
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      offDown();
      offMove();
      offUp();
      unsubscribe();
      engine.destroy();
    };
  }, []);

  return <div className="canvas-root" ref={containerRef} />;
};

export default CanvasRoot;
