export type Listener<T> = (state: T) => void;

export type Store<T> = {
  getState: () => T;
  setState: (
    next: T | Partial<T> | ((prev: T) => T),
    options?: { replace?: boolean }
  ) => void;
  subscribe: (listener: Listener<T>) => () => void;
};

export const createStore = <T extends Record<string, unknown>>(
  initial: T
): Store<T> => {
  let state = initial;
  const listeners = new Set<Listener<T>>();

  const getState = () => state;

  const setState: Store<T>["setState"] = (next, options) => {
    const replace = options?.replace ?? false;
    const nextState = typeof next === "function" ? next(state) : next;

    state = replace
      ? (nextState as T)
      : ({ ...state, ...(nextState as Partial<T>) } as T);

    listeners.forEach((listener) => listener(state));
  };

  const subscribe = (listener: Listener<T>) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
};
