import {
  PenTool,
  Pencil,
  Brush,
  Eraser,
  Hand,
  LassoSelect
} from "lucide-react";

const LeftToolbar = () => {
  return (
    <aside className="tool-wheel tool-wheel--fan">
      <div className="tool-wheel__ring" aria-hidden="true" />
      <button
        type="button"
        className="tool-wheel__item tool-wheel__item--pen tool-wheel__item--active"
      >
        <PenTool size={16} />
      </button>
      <button type="button" className="tool-wheel__item tool-wheel__item--pencil">
        <Pencil size={16} />
      </button>
      <button type="button" className="tool-wheel__item tool-wheel__item--marker">
        <Brush size={16} />
      </button>
      <button type="button" className="tool-wheel__item tool-wheel__item--eraser">
        <Eraser size={16} />
      </button>
      <button type="button" className="tool-wheel__item tool-wheel__item--hand">
        <Hand size={16} />
      </button>
      <button type="button" className="tool-wheel__item tool-wheel__item--lasso">
        <LassoSelect size={16} />
      </button>
      <div className="tool-wheel__colors">
        <button type="button" className="color-swatch color-swatch--warm" />
        <button type="button" className="color-swatch color-swatch--green" />
        <button type="button" className="color-swatch color-swatch--blue" />
        <button type="button" className="color-swatch color-swatch--ink" />
      </div>
    </aside>
  );
};

export default LeftToolbar;
