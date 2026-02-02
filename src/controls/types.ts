import type { Point, Rect } from "@/types/canvas";

export type ControlHandleType = "scale" | "rotate";
export type ControlHandleId =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w"
  | "rotate";

export type ControlHandle = {
  id: ControlHandleId;
  type: ControlHandleType;
  position: Point;
  cursor: string;
};

export type ControlBounds = Rect;
