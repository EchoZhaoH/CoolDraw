import { ZoomIn, ZoomOut, Maximize, Hand, Move } from "lucide-react";

const RightToolbar = () => {
  return (
    <aside className="floating-bar floating-bar--right tool-rack">
      <button type="button" className="icon-btn">
        <ZoomIn size={16} />
      </button>
      <button type="button" className="icon-btn">
        <ZoomOut size={16} />
      </button>
      <button type="button" className="icon-btn">
        <Maximize size={16} />
      </button>
      <button type="button" className="icon-btn">
        <Hand size={16} />
      </button>
      <button type="button" className="icon-btn">
        <Move size={16} />
      </button>
    </aside>
  );
};

export default RightToolbar;
