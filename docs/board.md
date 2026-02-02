# Board 模块设计方案

## 目标
- 将 `CanvasRoot` 中的引擎/交互/shape 相关逻辑抽离到 Board 模块
- UI 组件仅负责容器与生命周期
- 集中管理渲染引擎、交互状态与 shape 计算

## 模块结构（建议）
```
src/board/
  Board.ts
  types.ts
  controls.ts
  selection.ts
  viewport.ts
  helpers.ts
```

## 责任边界
### Board 负责
- 管理 `CanvasEngine` 实例与渲染刷新
- 统一处理 pointer/keyboard/wheel 事件
- 维护交互 session（drag/pan/control）
- 与 `canvasStore` 交互（读 state、写 action）
- 复用 shape registry 进行 bounds/hitTest

### UI 组件负责
- 容器 DOM
- 挂载/销毁 Board
- 透传可选配置（如热键开关）

## Board API（建议）
```ts
type BoardOptions = {
  container: HTMLElement;
  store: typeof canvasStore;
};

class Board {
  constructor(options: BoardOptions);
  mount(): void;
  unmount(): void;
  setState(state: CanvasState): void;
}
```

## 数据流
1. UI 创建 `Board` → `Board` 创建 `CanvasEngine`
2. `store.subscribe` 推送到 `Board.setState`
3. `Board` 内部处理事件 → 调用 `store.actions`

## 迁移步骤（建议）
1. 将 `screenToWorld/getBounds/intersects` 抽到 `board/helpers.ts`
2. 将 drag/pan/control session 与事件逻辑迁到 `Board.ts`
3. `CanvasRoot` 仅保留 mount/unmount
4. 保持 `store.actions` 与 renderer 不变，降低改动面

## 关键收益
- UI 层更干净，交互逻辑集中
- 方便多画布与工具扩展
- 交互状态集中，便于测试与调试
