import { Minus, Plus } from "lucide-react";
import { useCanvasActions, useCanvasStore } from "@/ui/hooks/useCanvasStore";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const ZoomControl = () => {
  const viewport = useCanvasStore((state) => state.viewport);
  const actions = useCanvasActions();

  const setScale = (nextScale: number) => {
    actions.setViewport({
      ...viewport,
      scale: clamp(nextScale, 0.2, 3)
    });
  };

  return (
    <div className="ui-panel zoom-control" role="group" aria-label="缩放控制">
      <button
        type="button"
        className="icon-btn icon-btn--ghost"
        onClick={() => setScale(viewport.scale / 1.1)}
        aria-label="缩小"
      >
        <Minus size={16} />
      </button>
      <button
        type="button"
        className="zoom-control__value zoom-control__value-btn"
        onClick={() => setScale(1)}
        aria-label="重置为 100%"
      >
        {Math.round(viewport.scale * 100)}%
      </button>
      <button
        type="button"
        className="icon-btn icon-btn--ghost"
        onClick={() => setScale(viewport.scale * 1.1)}
        aria-label="放大"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default ZoomControl;
