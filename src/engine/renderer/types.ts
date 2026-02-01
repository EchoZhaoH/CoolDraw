import type { CanvasState } from "@/types/canvas";

export type Renderer = {
  render: (state: CanvasState) => void;
  destroy: () => void;
};
