export type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

export const createHistory = <T>(initial: T) => {
  let state: HistoryState<T> = {
    past: [],
    present: initial,
    future: []
  };

  const push = (next: T) => {
    state = {
      past: [...state.past, state.present],
      present: next,
      future: []
    };
  };

  const undo = () => {
    if (state.past.length === 0) {
      return state.present;
    }
    const previous = state.past[state.past.length - 1];
    state = {
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future]
    };
    return state.present;
  };

  const redo = () => {
    if (state.future.length === 0) {
      return state.present;
    }
    const next = state.future[0];
    state = {
      past: [...state.past, state.present],
      present: next,
      future: state.future.slice(1)
    };
    return state.present;
  };

  const getState = () => state;

  return {
    getState,
    push,
    undo,
    redo
  };
};
