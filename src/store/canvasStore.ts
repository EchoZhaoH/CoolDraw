import { createHistory } from "./history/history";
import { createStore } from "@/utils/store";
import { createId } from "@/utils/id";
import type {
  CanvasEdge,
  CanvasConnectorNode,
  CanvasGeometryNode,
  CanvasGroup,
  CanvasNode,
  CanvasState,
  CanvasTextNode,
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

const setState = (next: CanvasState, options?: { pushHistory?: boolean }) => {
  const pushHistory = options?.pushHistory ?? true;
  if (pushHistory) {
    history.push(next);
  }
  store.setState(next, { replace: true });
};

const updateState = (
  updater: (state: CanvasState) => CanvasState,
  options?: { pushHistory?: boolean }
) => {
  setState(updater(store.getState()), options);
};

const createGeometryNode = (
  partial: Partial<CanvasGeometryNode> = {}
): CanvasGeometryNode => ({
  id: partial.id ?? createId("node"),
  type: "geometry",
  kind: partial.kind ?? "rect",
  position: partial.position ?? { x: 120, y: 120 },
  size: partial.size ?? { width: 160, height: 96 },
  rotation: partial.rotation ?? 0,
  data: partial.data ?? {}
});

const createTextNode = (partial: Partial<CanvasTextNode> = {}): CanvasTextNode => ({
  id: partial.id ?? createId("node"),
  type: "text",
  position: partial.position ?? { x: 120, y: 120 },
  size: partial.size ?? { width: 180, height: 40 },
  rotation: partial.rotation ?? 0,
  data: partial.data ?? {}
});

const createNodeByType = (
  partial: Partial<CanvasNode> & { type: CanvasNode["type"] }
): CanvasNode => {
  if (partial.type === "text") {
    return createTextNode(partial as Partial<CanvasTextNode>);
  }
  if (partial.type === "connector") {
    const connector: CanvasConnectorNode = {
      id: partial.id ?? createId("node"),
      type: "connector",
      mode: partial.mode ?? "free",
      source: partial.source ?? { position: { x: 80, y: 80 } },
      target: partial.target ?? { position: { x: 240, y: 160 } },
      position: partial.position ?? { x: 0, y: 0 },
      size: partial.size ?? { width: 0, height: 0 },
      rotation: partial.rotation ?? 0,
      style: partial.style,
      data: partial.data ?? {}
    };
    return connector;
  }
  return createGeometryNode(partial as Partial<CanvasGeometryNode>);
};

const actions = {
  addNodes: (nodes: Array<Partial<CanvasNode> & { type: CanvasNode["type"] }>) => {
    updateState((state) => ({
      ...state,
      nodes: [...state.nodes, ...nodes.map(createNodeByType)],
      updatedAt: Date.now()
    }));
  },
  addNode: (node: Partial<CanvasNode> & { type: CanvasNode["type"] }) => {
    updateState((state) => ({
      ...state,
      nodes: [...state.nodes, createNodeByType(node)],
      updatedAt: Date.now()
    }));
  },
  addGeometry: (kind: "rect" | "ellipse" = "rect") => {
    updateState((state) => ({
      ...state,
      nodes: [
        ...state.nodes,
        createGeometryNode({
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
        createTextNode({ data: { text, fontSize: 16 } })
      ],
      updatedAt: Date.now()
    }));
  },
  updateNode: (id: string, patch: Partial<CanvasNode>) => {
    updateState((state) => ({
      ...state,
      nodes: state.nodes.map((node) =>
        node.id === id ? ({ ...node, ...patch } as CanvasNode) : node
      ),
      updatedAt: Date.now()
    }));
  },
  updateNodePreview: (id: string, patch: Partial<CanvasNode>) => {
    updateState(
      (state) => ({
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === id ? ({ ...node, ...patch } as CanvasNode) : node
        ),
        updatedAt: Date.now()
      }),
      { pushHistory: false }
    );
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
          } as CanvasNode;
        }),
        updatedAt: Date.now()
      };
    });
  },
  updateNodesTransformPreview: (
    updates: Array<{
      id: string;
      position?: { x: number; y: number };
      size?: { width: number; height: number };
      rotation?: number;
    }>
  ) => {
    updateState(
      (state) => {
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
              position: next.position ?? node.position,
              size: next.size ?? node.size,
              rotation: next.rotation ?? node.rotation
            } as CanvasNode;
          }),
          updatedAt: Date.now()
        };
      },
      { pushHistory: false }
    );
  },
  updateNodesTransformCommit: (
    updates: Array<{
      id: string;
      position?: { x: number; y: number };
      size?: { width: number; height: number };
      rotation?: number;
    }>
  ) => {
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
            position: next.position ?? node.position,
            size: next.size ?? node.size,
            rotation: next.rotation ?? node.rotation
          } as CanvasNode;
        }),
        updatedAt: Date.now()
      };
    });
  },
  updateNodesPositionPreview: (
    updates: Array<{ id: string; x: number; y: number }>
  ) => {
    updateState(
      (state) => {
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
            } as CanvasNode;
          }),
          updatedAt: Date.now()
        };
      },
      { pushHistory: false }
    );
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
