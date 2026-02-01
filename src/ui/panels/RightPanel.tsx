import { useCanvasStore } from "@/ui/hooks/useCanvasStore";

const RightPanel = () => {
  const state = useCanvasStore((current) => current);

  return (
    <aside className="right-panel">
      <h2>属性面板</h2>
      <div className="panel-section">
        <h3>统计</h3>
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
        <h3>视图</h3>
        <div className="panel-row">
          <span>缩放</span>
          <span>{state.viewport.scale.toFixed(2)}</span>
        </div>
        <div className="panel-row">
          <span>偏移</span>
          <span>
            {state.viewport.x}, {state.viewport.y}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
