import { Undo2, Redo2, Share2, Download, Settings } from "lucide-react";
import { useCanvasActions } from "@/ui/hooks/useCanvasStore";

const TopBar = () => {
  const actions = useCanvasActions();

  return (
    <div className="floating-bar floating-bar--top">
      <span className="brand">wukong</span>
      <button type="button" className="icon-btn" onClick={actions.undo}>
        <Undo2 size={16} />
      </button>
      <button type="button" className="icon-btn" onClick={actions.redo}>
        <Redo2 size={16} />
      </button>
      <button type="button" className="icon-btn">
        <Download size={16} />
      </button>
      <button type="button" className="icon-btn">
        <Share2 size={16} />
      </button>
      <button type="button" className="icon-btn">
        <Settings size={16} />
      </button>
    </div>
  );
};

export default TopBar;
