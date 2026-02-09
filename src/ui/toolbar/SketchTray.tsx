import type { ReactNode } from "react";
import { useCanvasActions } from "@/ui/hooks/useCanvasStore";
import data from "../../../skills/zoom-fy2025-report.json";

const SketchIcon = ({ children }: { children: ReactNode }) => (
  <span className="tool-btn__icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" role="presentation">
      {children}
    </svg>
  </span>
);

const SketchTray = () => {
  const actions = useCanvasActions();

  return (
    <div className="tool-tray">
      <div className="tool-group">
        <span className="tool-group__label">绘制</span>
        <button type="button" className="tool-btn tool-btn--active">
          <SketchIcon>
            <path d="M5 5l8 8" />
            <path d="M5 5l0 6l6 0z" />
          </SketchIcon>
          选择
        </button>
        <button type="button" className="tool-btn" onClick={() => actions.addGeometry("rect")}>
          <SketchIcon>
            <rect x="5" y="6" width="14" height="12" rx="2" />
          </SketchIcon>
          矩形
        </button>
        <button type="button" className="tool-btn" onClick={() => actions.addGeometry("ellipse")}>
          <SketchIcon>
            <ellipse cx="12" cy="12" rx="7" ry="5" />
          </SketchIcon>
          圆形
        </button>
        <button type="button" className="tool-btn">
          <SketchIcon>
            <path d="M4 12h16" />
            <path d="M16 8l4 4l-4 4" />
          </SketchIcon>
          连线
        </button>
        <button type="button" className="tool-btn" onClick={() => actions.addText("文本")}>
          <SketchIcon>
            <path d="M6 7h12" />
            <path d="M12 7v10" />
            <path d="M8 17h8" />
          </SketchIcon>
          文本
        </button>
        <button type="button" className="tool-btn">
          <SketchIcon>
            <path d="M6 18l4-4l6-6l2 2l-6 6l-4 4" />
            <path d="M5 19l3-1" />
          </SketchIcon>
          画笔
        </button>
        <button type="button" className="tool-btn" onClick={() => actions.addNodes(data)}>
          <SketchIcon>
            <path d="M6 7h10l2 2v8a2 2 0 0 1-2 2H6z" />
            <path d="M14 7v4h4" />
          </SketchIcon>
          便签
        </button>
      </div>
      <div className="tool-group">
        <span className="tool-group__label">视图</span>
        <button type="button" className="tool-btn">
          <SketchIcon>
            <circle cx="10" cy="10" r="4" />
            <path d="M14 14l4 4" />
          </SketchIcon>
          放大
        </button>
        <button type="button" className="tool-btn">
          <SketchIcon>
            <circle cx="10" cy="10" r="4" />
            <path d="M8 10h4" />
            <path d="M14 14l4 4" />
          </SketchIcon>
          缩小
        </button>
        <button type="button" className="tool-btn">
          <SketchIcon>
            <path d="M4 4h6v2H6v4H4z" />
            <path d="M20 4v6h-2V6h-4V4z" />
            <path d="M4 20v-6h2v4h4v2z" />
            <path d="M20 20h-6v-2h4v-4h2z" />
          </SketchIcon>
          适配
        </button>
        <button type="button" className="tool-btn">
          <SketchIcon>
            <path d="M7 6c2-2 8-2 10 0" />
            <path d="M6 10c0-2 2-3 6-3s6 1 6 3" />
            <path d="M8 18c0-3 8-3 8 0" />
          </SketchIcon>
          手型
        </button>
        <button type="button" className="tool-btn">
          <SketchIcon>
            <path d="M4 12h16" />
            <path d="M12 4v16" />
            <path d="M8 8l-4 4l4 4" />
            <path d="M16 8l4 4l-4 4" />
          </SketchIcon>
          移动
        </button>
      </div>
      <div className="tool-group">
        <span className="tool-group__label">操作</span>
        <button type="button" className="tool-btn" onClick={actions.undo}>
          <SketchIcon>
            <path d="M8 7l-4 4l4 4" />
            <path d="M6 11h6a6 6 0 0 1 6 6" />
          </SketchIcon>
          撤销
        </button>
        <button type="button" className="tool-btn" onClick={actions.redo}>
          <SketchIcon>
            <path d="M16 7l4 4l-4 4" />
            <path d="M18 11h-6a6 6 0 0 0-6 6" />
          </SketchIcon>
          重做
        </button>
        <button type="button" className="tool-btn">
          <SketchIcon>
            <path d="M6 7h12v10H6z" />
            <path d="M8 5h8" />
          </SketchIcon>
          导出
        </button>
        <button type="button" className="tool-btn">
          <SketchIcon>
            <path d="M12 4v10" />
            <path d="M8 8l4-4l4 4" />
            <path d="M6 14h12v6H6z" />
          </SketchIcon>
          分享
        </button>
        <button type="button" className="tool-btn">
          <SketchIcon>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 4v3" />
            <path d="M12 17v3" />
            <path d="M4 12h3" />
            <path d="M17 12h3" />
          </SketchIcon>
          设置
        </button>
      </div>
      <div className="tool-group tool-group--compact">
        <span className="tool-group__label">辅助</span>
        <button type="button" className="tool-btn">
          <SketchIcon>
            <path d="M6 6h12v12H6z" />
            <path d="M8 9h8" />
            <path d="M8 13h6" />
          </SketchIcon>
          历史
        </button>
        <button type="button" className="tool-btn">
          <SketchIcon>
            <path d="M7 7h10v10H7z" />
            <path d="M5 5h10v10" />
          </SketchIcon>
          图层
        </button>
        <button type="button" className="tool-btn">
          <SketchIcon>
            <path d="M6 17l6-10l6 10z" />
            <path d="M8 14h8" />
          </SketchIcon>
          主题
        </button>
        <button type="button" className="tool-btn">
          <SketchIcon>
            <circle cx="12" cy="9" r="3" />
            <path d="M6 19c1-3 11-3 12 0" />
          </SketchIcon>
          账户
        </button>
        <button type="button" className="tool-btn">
          <SketchIcon>
            <circle cx="12" cy="12" r="7" />
            <path d="M12 8v4" />
            <path d="M12 16h0" />
          </SketchIcon>
          帮助
        </button>
      </div>
      <div className="tool-meta">
        <span>100%</span>
        <span>0, 0</span>
      </div>
    </div>
  );
};

export default SketchTray;
