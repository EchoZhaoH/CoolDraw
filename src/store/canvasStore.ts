import { createHistory } from "./history/history";
import { createStore } from "@/utils/store";
import { createId } from "@/utils/id";
import type {
  CanvasEdge,
  CanvasGroup,
  CanvasNode,
  CanvasState,
  Selection,
  Viewport
} from "@/types/canvas";

const initialState: CanvasState = {
  nodes: [],
  edges: [],
  groups: [],
  selection: {
    nodeIds: [],
    edgeIds: [],
    groupIds: [],
    mode: "single"
  },
  viewport: {
    x: 0,
    y: 0,
    scale: 1
  },
  updatedAt: Date.now()
};

const history = createHistory(initialState);
const store = createStore(initialState);

const setState = (next: CanvasState) => {
  history.push(next);
  store.setState(next, { replace: true });
};

const updateState = (updater: (state: CanvasState) => CanvasState) => {
  setState(updater(store.getState()));
};

const createNode = (partial: Partial<CanvasNode> = {}): CanvasNode => ({
  id: partial.id ?? createId("node"),
  type: partial.type ?? "geometry",
  kind: partial.kind ?? "rect",
  position: partial.position ?? { x: 120, y: 120 },
  size: partial.size ?? { width: 160, height: 96 },
  data: partial.data ?? {}
});

const actions = {
  addNode: (partial?: Partial<CanvasNode>) => {
    updateState((state) => ({
      ...state,
      nodes: [...state.nodes, createNode(partial)],
      updatedAt: Date.now()
    }));
  },
  addGeometry: (kind: "rect" | "ellipse" = "rect") => {
    updateState((state) => ({
      ...state,
      nodes: [
        ...state.nodes,
        createNode({
          type: "geometry",
          kind,
          size: kind === "ellipse" ? { width: 140, height: 140 } : undefined
        })
      ],
      updatedAt: Date.now()
    }));
  },
  addText: (text = "文本") => {
    updateState((state) => ({
      ...state,
      nodes: [
        ...state.nodes,
        createNode({
          type: "text",
          size: { width: 180, height: 40 },
          data: { text, fontSize: 16 }
        })
      ],
      updatedAt: Date.now()
    }));
  },
  updateNode: (id: string, patch: Partial<CanvasNode>) => {
    updateState((state) => ({
      ...state,
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...patch } : node
      ),
      updatedAt: Date.now()
    }));
  },
  updateNodesPosition: (updates: Array<{ id: string; x: number; y: number }>) => {
    updateState((state) => {
      const map = new Map(updates.map((item) => [item.id, item]));
      return {
        ...state,
        nodes: state.nodes.map((node) => {
          const next = map.get(node.id);
          if (!next) {
            return node;
          }
          return {
            ...node,
            position: { x: next.x, y: next.y }
          };
        }),
        updatedAt: Date.now()
      };
    });
  },
  removeNode: (id: string) => {
    updateState((state) => ({
      ...state,
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
      selection: {
        ...state.selection,
        nodeIds: state.selection.nodeIds.filter((nodeId) => nodeId !== id)
      },
      updatedAt: Date.now()
    }));
  },
  addEdge: (edge: Omit<CanvasEdge, "id">) => {
    updateState((state) => ({
      ...state,
      edges: [...state.edges, { ...edge, id: createId("edge") }],
      updatedAt: Date.now()
    }));
  },
  removeEdge: (id: string) => {
    updateState((state) => ({
      ...state,
      edges: state.edges.filter((edge) => edge.id !== id),
      selection: {
        ...state.selection,
        edgeIds: state.selection.edgeIds.filter((edgeId) => edgeId !== id)
      },
      updatedAt: Date.now()
    }));
  },
  addGroup: (group: Omit<CanvasGroup, "id">) => {
    updateState((state) => ({
      ...state,
      groups: [...state.groups, { ...group, id: createId("group") }],
      updatedAt: Date.now()
    }));
  },
  setSelection: (selection: Selection) => {
    updateState((state) => ({
      ...state,
      selection,
      updatedAt: Date.now()
    }));
  },
  clearSelection: () => {
    updateState((state) => ({
      ...state,
      selection: {
        nodeIds: [],
        edgeIds: [],
        groupIds: [],
        mode: "single"
      },
      updatedAt: Date.now()
    }));
  },
  toggleSelection: (nodeId: string) => {
    updateState((state) => {
      const exists = state.selection.nodeIds.includes(nodeId);
      return {
        ...state,
        selection: {
          ...state.selection,
          mode: "multi",
          nodeIds: exists
            ? state.selection.nodeIds.filter((id) => id !== nodeId)
            : [...state.selection.nodeIds, nodeId]
        },
        updatedAt: Date.now()
      };
    });
  },
  setSelectionBox: (box: Selection["box"]) => {
    updateState((state) => ({
      ...state,
      selection: {
        ...state.selection,
        box,
        mode: "multi"
      },
      updatedAt: Date.now()
    }));
  },
  clearSelectionBox: () => {
    updateState((state) => ({
      ...state,
      selection: {
        ...state.selection,
        box: undefined
      },
      updatedAt: Date.now()
    }));
  },
  setViewport: (viewport: Viewport) => {
    updateState((state) => ({
      ...state,
      viewport,
      updatedAt: Date.now()
    }));
  },
  reset: () => {
    setState({ ...initialState, updatedAt: Date.now() });
  },
  undo: () => {
    const previous = history.undo();
    store.setState(previous, { replace: true });
  },
  redo: () => {
    const next = history.redo();
    store.setState(next, { replace: true });
  }
};

export const canvasStore = {
  getState: store.getState,
  subscribe: store.subscribe,
  actions
};
