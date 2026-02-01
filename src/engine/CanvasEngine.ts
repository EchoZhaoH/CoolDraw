import type { FederatedPointerEvent } from "pixi.js";
import type { CanvasState } from "@/types/canvas";
import { EngineEventEmitter } from "@/engine/events/emitter";
import type { EnginePointerEvent } from "@/engine/events/types";
import { PixiRenderer } from "@/engine/renderer/PixiRenderer";

export class CanvasEngine {
  private renderer: PixiRenderer;
  private events = new EngineEventEmitter();

  constructor(container: HTMLElement, renderer?: PixiRenderer) {
    this.renderer = renderer ?? new PixiRenderer(container);
    this.bindStageEvents();
    this.renderer.setNodeMountedHandler((id, view) => {
      view.on("pointerdown", (event) => {
        event.stopPropagation();
        this.emitPointer("pointerDown", event, id);
      });
      view.on("pointerup", (event) => {
        event.stopPropagation();
        this.emitPointer("pointerUp", event, id);
      });
      view.on("pointermove", (event) => {
        event.stopPropagation();
        this.emitPointer("pointerMove", event, id);
      });
    });
  }

  setState(state: CanvasState) {
    this.renderer.render(state);
  }

  destroy() {
    this.renderer.destroy();
  }

  on = this.events.on.bind(this.events);
  off = this.events.off.bind(this.events);

  private bindStageEvents() {
    const stage = this.renderer.getStage();
    stage.on("pointerdown", (event) =>
      this.emitPointer("pointerDown", event)
    );
    stage.on("pointerup", (event) => this.emitPointer("pointerUp", event));
    stage.on("pointermove", (event) =>
      this.emitPointer("pointerMove", event)
    );
  }

  private emitPointer(
    type: "pointerDown" | "pointerMove" | "pointerUp",
    event: FederatedPointerEvent,
    targetId?: string
  ) {
    const payload: EnginePointerEvent = {
      position: {
        x: event.global.x,
        y: event.global.y
      },
      button: event.button ?? 0,
      targetId,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey
    };
    this.events.emit(type, payload);
  }
}
