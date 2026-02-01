import { useCanvasStore } from "@/ui/hooks/useCanvasStore";

const SidePanel = () => {
  const state = useCanvasStore((current) => current);

  return (
    <aside className="side-panel">
      <h2>状态概览</h2>
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
      <div className="panel-row">
        <span>缩放</span>
        <span>{state.viewport.scale.toFixed(2)}</span>
      </div>
    </aside>
  );
};

export default SidePanel;
