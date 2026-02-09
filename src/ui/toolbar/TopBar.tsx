import { Settings } from "lucide-react";

const TopBar = () => {
  return (
    <>
      <header className="ui-panel top-bar top-bar--left">
        <span className="top-bar__title">未命名画板</span>
      </header>
      <div className="ui-panel top-bar top-bar--right">
        <button type="button" className="icon-btn" aria-label="设置">
          <Settings size={16} />
        </button>
      </div>
    </>
  );
};

export default TopBar;
