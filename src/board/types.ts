import type { CanvasState, Selection, Viewport } from "@/types/canvas";

export type BoardStore = {
  getState: () => CanvasState;
  subscribe: (listener: (state: CanvasState) => void) => () => void;
  actions: {
    setSelection: (selection: Selection) => void;
    clearSelection: () => void;
    toggleSelection: (nodeId: string) => void;
    setSelectionBox: (box: Selection["box"]) => void;
    clearSelectionBox: () => void;
    setViewport: (viewport: Viewport) => void;
    updateNodesPositionPreview: (
      updates: Array<{ id: string; x: number; y: number }>
    ) => void;
    updateNodesPosition: (
      updates: Array<{ id: string; x: number; y: number }>
    ) => void;
    updateNodesTransformPreview: (
      updates: Array<{
        id: string;
        position?: { x: number; y: number };
        size?: { width: number; height: number };
        rotation?: number;
      }>
    ) => void;
    updateNodesTransformCommit: (
      updates: Array<{
        id: string;
        position?: { x: number; y: number };
        size?: { width: number; height: number };
        rotation?: number;
      }>
    ) => void;
  };
};

export type BoardOptions = {
  container: HTMLElement;
  store: BoardStore;
};
