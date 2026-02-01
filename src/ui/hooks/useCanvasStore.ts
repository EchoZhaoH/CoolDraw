import { useSyncExternalStore } from "react";
import { canvasStore } from "@/store/canvasStore";
import type { CanvasState } from "@/types/canvas";

export const useCanvasStore = <T>(selector: (state: CanvasState) => T): T => {
  return useSyncExternalStore(
    canvasStore.subscribe,
    () => selector(canvasStore.getState()),
    () => selector(canvasStore.getState())
  );
};

export const useCanvasActions = () => canvasStore.actions;
