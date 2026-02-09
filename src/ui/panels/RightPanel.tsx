import { useState } from "react";
import { ChevronRight, Layers, Shapes, Magnet } from "lucide-react";
import { useCanvasStore } from "@/ui/hooks/useCanvasStore";

const RightPanel = () => {
  const state = useCanvasStore((current) => current);
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside className={`right-panel ${collapsed ? "right-panel--collapsed" : ""}`}>
      <div className="right-panel__header">
        <h2>面板</h2>
        <button
          type="button"
          className="icon-btn icon-btn--ghost"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? "展开面板" : "收起面板"}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="panel-section">
        <h3>
          <Layers size={14} /> 图层
        </h3>
        <div className="panel-row">
          <span>草图</span>
          <span>{state.nodes.length}</span>
        </div>
        <div className="panel-row">
          <span>图片</span>
          <span>3</span>
        </div>
        <div className="panel-row">
          <span>标注</span>
          <span>6</span>
        </div>
      </div>
      <div className="panel-section">
        <h3>
          <Shapes size={14} /> 对象
        </h3>
        <div className="panel-row">
          <span>节点</span>
          <span>{state.nodes.length}</span>
        </div>
        <div className="panel-row">
          <span>连线</span>
          <span>{state.edges.length}</span>
        </div>
        <div className="panel-row">
          <span>分组</span>
          <span>{state.groups.length}</span>
        </div>
      </div>
      <div className="panel-section">
        <h3>
          <Magnet size={14} /> 精确
        </h3>
        <div className="panel-row">
          <span>吸附</span>
          <span>开</span>
        </div>
        <div className="panel-row">
          <span>对齐</span>
          <span>开</span>
        </div>
        <div className="panel-row">
          <span>网格</span>
          <span>关</span>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
