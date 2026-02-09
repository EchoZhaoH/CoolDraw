import { HelpCircle, MessageCircle } from "lucide-react";

const BottomRightBar = () => {
  return (
    <div className="floating-bar floating-bar--bottom-right tool-strip tool-strip--compact">
      <button type="button" className="icon-btn">
        <MessageCircle size={16} />
      </button>
      <button type="button" className="icon-btn">
        <HelpCircle size={16} />
      </button>
    </div>
  );
};

export default BottomRightBar;
