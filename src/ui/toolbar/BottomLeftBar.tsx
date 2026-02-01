import { History, Layers } from "lucide-react";

const BottomLeftBar = () => {
  return (
    <div className="floating-bar floating-bar--bottom-left">
      <button type="button" className="icon-btn">
        <History size={16} />
      </button>
      <button type="button" className="icon-btn">
        <Layers size={16} />
      </button>
    </div>
  );
};

export default BottomLeftBar;
