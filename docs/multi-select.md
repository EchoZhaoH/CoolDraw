# 多选设计

本文档定义多选（点击与框选）在当前画布体系中的数据结构与交互约定，服务后续实现与扩展。

## 目标与范围
- 支持单选、Shift 多选、框选。
- 多选行为只更新 state，不直接操作渲染视图。
- 只覆盖 nodes 选择（edges/groups 后续扩展）。

## 状态结构
在 `CanvasState.selection` 中扩展多选相关字段。

```ts
export type SelectionState = {
  nodeIds: string[];
  edgeIds: string[];
  groupIds: string[];
  mode: "single" | "multi";
  box?: { x: number; y: number; width: number; height: number };
};
```

## 交互流程

### 点击选择
- 点击 shape：清空旧 selection，仅保留当前 node。
- Shift + 点击：切换 node 是否在 selection 中（加入/移除）。
- 点击空白：清空 selection。

### 框选选择
- 空白区域 pointerDown → 进入框选模式，初始化 `selection.box`。
- pointerMove → 更新 `selection.box`。
- pointerUp → 计算 box 与 shapes 的相交关系，更新 `selection.nodeIds`。
- 结束后清空 `selection.box`。

## 命中测试与选择策略
- 默认使用 `handler.getBounds` 的矩形相交。
- 对复杂图形可升级为 `handler.hitTest` 或 `getSnapPoints`。
- 框选策略默认选择与 box 相交的 nodes；可扩展为“完全包含”模式。

## 渲染反馈
- 选中项：在 overlay layer 绘制高亮边框。
- 框选矩形：在 overlay layer 绘制半透明选择框。

## Actions 设计
```ts
type SelectionActions =
  | { type: "selection.clear" }
  | { type: "selection.set"; nodeIds: string[]; mode: "single" | "multi" }
  | { type: "selection.toggle"; nodeId: string }
  | { type: "selection.box.set"; box: Rect }
  | { type: "selection.box.clear" };
```

## 扩展点
- edge/group 选择与高亮。
- 框选模式切换（交集/包含）。
- 多选拖拽与对齐（操作 selection 集合）。
- 结合 AI actions 进行批量修改。

## 当前实现对齐
- 选择状态与 actions：`src/store/canvasStore.ts`
- 选择交互（点击/Shift/框选）：`src/ui/components/CanvasRoot.tsx`
- 选择渲染反馈（高亮/框选）：`src/engine/renderer/PixiRenderer.ts`
