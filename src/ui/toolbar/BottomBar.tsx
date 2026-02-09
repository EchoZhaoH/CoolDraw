import {
  MousePointer2,
  Hand,
  Pencil,
  StickyNote,
  Square,
  Type,
  Smile
} from "lucide-react";
import { useState } from "react";
import { useCanvasActions } from "@/ui/hooks/useCanvasStore";

const tools = [
  { id: "select", label: "选择", icon: MousePointer2 },
  { id: "hand", label: "手型", icon: Hand },
  { id: "pen", label: "画笔", icon: Pencil },
  { id: "sticky", label: "便签", icon: StickyNote },
  { id: "shape", label: "形状", icon: Square },
  { id: "text", label: "文本", icon: Type },
  { id: "emoji", label: "表情", icon: Smile }
];

const BottomBar = () => {
  const [activeId, setActiveId] = useState("select");
  const actions = useCanvasActions();

  const handleTool = (id: string) => {
    setActiveId(id);
    if (id === "select") {
      actions.clearSelection();
      return;
    }
    if (id === "hand") {
      actions.clearSelection();
      return;
    }
    if (id === "pen") {
      actions.addText("笔触");
      return;
    }
    if (id === "sticky") {
      actions.addText("便签");
      return;
    }
    if (id === "shape") {
      actions.addGeometry("rect");
      return;
    }
    if (id === "text") {
      actions.addText("文本");
      return;
    }
    if (id === "emoji") {
      actions.addText("表情");
    }
  };

  return (
    <footer className="ui-panel bottom-toolbar" role="toolbar" aria-label="工具栏">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.id}
            type="button"
            className={`tool-btn tool-btn--icon${
              activeId === tool.id ? " tool-btn--active" : ""
            }`}
            onClick={() => handleTool(tool.id)}
            aria-pressed={activeId === tool.id}
            aria-label={tool.label}
          >
            <span className="tool-btn__icon" aria-hidden="true">
              <Icon size={16} />
            </span>
            <span className="tool-btn__label">{tool.label}</span>
          </button>
        );
      })}
    </footer>
  );
};

export default BottomBar;
