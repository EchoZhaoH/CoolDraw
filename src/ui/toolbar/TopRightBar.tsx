import { User, Moon, Sun } from "lucide-react";

const TopRightBar = () => {
  return (
    <div className="floating-bar floating-bar--top-right tool-strip tool-strip--compact">
      <button type="button" className="icon-btn">
        <Sun size={16} />
      </button>
      <button type="button" className="icon-btn">
        <Moon size={16} />
      </button>
      <button type="button" className="icon-btn">
        <User size={16} />
      </button>
    </div>
  );
};

export default TopRightBar;
