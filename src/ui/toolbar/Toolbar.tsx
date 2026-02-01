import { useCanvasActions } from "@/ui/hooks/useCanvasStore";
import { canvasStore } from "@/store/canvasStore";

const Toolbar = () => {
  const actions = useCanvasActions();

  const handleAddEdge = () => {
    const state = canvasStore.getState();
    if (state.nodes.length < 2) {
      return;
    }
    actions.addEdge({
      source: state.nodes[0].id,
      target: state.nodes[1].id,
      label: "Edge"
    });
  };

  return (
    <div className="toolbar">
      <button type="button" onClick={() => actions.addNode()}>
        Add Node
      </button>
      <button type="button" onClick={handleAddEdge}>
        Add Edge
      </button>
      <button type="button" onClick={actions.undo}>
        Undo
      </button>
      <button type="button" onClick={actions.redo}>
        Redo
      </button>
      <button type="button" onClick={actions.reset}>
        Reset
      </button>
    </div>
  );
};

export default Toolbar;
