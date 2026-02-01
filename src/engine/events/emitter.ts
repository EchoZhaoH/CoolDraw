import type { EngineEventMap } from "./types";

type Handler<K extends keyof EngineEventMap> = (event: EngineEventMap[K]) => void;

export class EngineEventEmitter {
  private listeners = new Map<keyof EngineEventMap, Set<Handler<any>>>();

  on<K extends keyof EngineEventMap>(event: K, handler: Handler<K>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(handler as Handler<any>);
    return () => this.off(event, handler);
  }

  off<K extends keyof EngineEventMap>(event: K, handler: Handler<K>) {
    this.listeners.get(event)?.delete(handler as Handler<any>);
  }

  emit<K extends keyof EngineEventMap>(event: K, payload: EngineEventMap[K]) {
    this.listeners.get(event)?.forEach((handler) => {
      handler(payload as EngineEventMap[keyof EngineEventMap]);
    });
  }
}
