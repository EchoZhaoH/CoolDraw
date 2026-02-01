import {
  MousePointer2,
  Square,
  Circle,
  ArrowRight,
  Type,
  PencilLine,
  StickyNote
} from "lucide-react";
import { useCanvasActions } from "@/ui/hooks/useCanvasStore";

const LeftToolbar = () => {
  const actions = useCanvasActions();

  return (
    <aside className="floating-bar floating-bar--left">
      <button type="button" className="icon-btn icon-btn--active">
        <MousePointer2 size={16} />
      </button>
      <button type="button" className="icon-btn" onClick={() => actions.addGeometry("rect")}>
        <Square size={16} />
      </button>
      <button type="button" className="icon-btn" onClick={() => actions.addGeometry("ellipse")}>
        <Circle size={16} />
      </button>
      <button type="button" className="icon-btn">
        <ArrowRight size={16} />
      </button>
      <button type="button" className="icon-btn" onClick={() => actions.addText("文本")}>
        <Type size={16} />
      </button>
      <button type="button" className="icon-btn">
        <PencilLine size={16} />
      </button>
      <button type="button" className="icon-btn" onClick={() => actions.addGeometry("rect")}>
        <StickyNote size={16} />
      </button>
    </aside>
  );
};

export default LeftToolbar;
