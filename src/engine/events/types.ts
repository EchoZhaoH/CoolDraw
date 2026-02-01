import type { Position } from "@/types/canvas";

export type EnginePointerEvent = {
  position: Position;
  button: number;
  targetId?: string;
  shiftKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
};

export type EngineEventMap = {
  pointerDown: EnginePointerEvent;
  pointerMove: EnginePointerEvent;
  pointerUp: EnginePointerEvent;
};
