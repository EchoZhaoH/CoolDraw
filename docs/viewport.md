# 画布缩放与平移设计

本文档定义画布缩放/平移的交互、状态与渲染策略，作为后续实现的规范依据。

## 目标与范围
- 支持滚轮缩放（以鼠标位置为缩放中心）。
- 支持空格/中键拖拽平移。
- 视口变化统一写入 `CanvasState.viewport`。

## 状态结构
```ts
export type Viewport = {
  x: number;
  y: number;
  scale: number;
};
```

## 缩放交互

### 滚轮缩放
- 触发：wheel 事件。
- 约束：`minScale <= scale <= maxScale`（如 0.2 ~ 4）。
- 以鼠标位置为缩放中心。

### 缩放中心公式
确保缩放前后鼠标指向的世界坐标不变：

```
world = (screen - offset) / scale
newOffset = screen - world * newScale
```

## 平移交互
- 触发：空格按住 + 左键拖拽，或中键拖拽。
- pointerDown：记录起点与当前 viewport。
- pointerMove：更新 `viewport.x/y`。
- pointerUp：结束平移。

## Actions 设计
```ts
type ViewportActions =
  | { type: "viewport.set"; x: number; y: number; scale: number }
  | { type: "viewport.pan"; dx: number; dy: number }
  | { type: "viewport.zoom"; scale: number; anchor: { x: number; y: number } };
```

## 渲染策略
- 使用 `worldContainer` 容纳 nodes/edges。
- `worldContainer.position = { x, y }`
- `worldContainer.scale = scale`
- overlay/UI 不受缩放影响。

## 约束与扩展点
- 限制 scale 上下限与步进精度。
- 支持双击重置视口/居中。
- 支持惯性拖拽与平滑缩放。
