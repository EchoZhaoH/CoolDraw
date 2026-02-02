import { useEffect, useRef } from "react";
import { canvasStore } from "@/store/canvasStore";
import { Board } from "@/board/Board";

const CanvasRoot = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const board = new Board({ container: containerRef.current, store: canvasStore });
    board.mount();

    return () => {
      board.unmount();
    };
  }, []);

  return <div className="canvas-root" ref={containerRef} />;
};

export default CanvasRoot;
