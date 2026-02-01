# 项目结构说明

本文档用于约定代码目录与模块职责，确保渲染、状态、UI 与持久化解耦，便于后续扩展。

## 目录结构

```
src/
  app/                # 应用启动与全局初始化
  engine/             # CanvasEngine（PixiJS）
    layers/           # nodes/edges/selection/overlay 图层
    events/           # 交互事件与命中测试
    renderer/         # 渲染流程与优化
  store/              # StateData（Zustand）
    slices/           # nodes/edges/groups 等分片
    history/          # undo/redo 与命令栈
  ui/                 # UI（React + shadcn/ui）
    components/       # 通用组件
    toolbar/          # 工具栏
    panels/           # 属性面板 / AI 面板
    hooks/            # UI 侧自定义 hooks
  ai/                 # AI actions 解析/校验/执行
  lib/                # shadcn/ui 共享工具
  persistence/        # IndexedDB 同步与恢复
  types/              # 共享类型定义
  utils/              # 通用工具
```

## 模块职责

### `engine/`
- 负责 PixiJS 渲染与交互，保持与状态层解耦
- 对外暴露渲染器与事件适配接口

### `store/`
- 统一管理 nodes/edges/groups 与 selection 状态
- 维护 undo/redo 历史与命令栈

### `ui/`
- 工具栏、属性面板与 AI 面板
- 仅通过 store 读取/更新状态
- shadcn/ui 组件放在 `src/ui/components/ui`，工具函数在 `src/lib/utils.ts`

### `ai/`
- 解析与校验结构化 actions（白名单）
- 批量执行并触发一次渲染

### `lib/`
- shadcn/ui 共享工具与样式辅助（如 `cn`）

## 设计文档
- 图形设计架构：`docs/shape-architecture.md`
- 多选设计：`docs/multi-select.md`
- 画布缩放/平移：`docs/viewport.md`

## 基础实现清单

已落地的基础文件，用于后续替换为 PixiJS/Zustand 的正式实现。

- `src/engine/CanvasEngine.ts`: 引擎壳与最小渲染器接口
- `src/engine/events/types.ts`: 交互事件类型
- `src/engine/events/emitter.ts`: 引擎事件派发
- `src/engine/renderer/types.ts`: 渲染器协议
- `src/engine/renderer/PixiRenderer.ts`: PixiJS 渲染实现
- `src/shapes/types.ts`: 图形类型与 handler 接口
- `src/shapes/geometry.ts`: geometry handler
- `src/shapes/text.ts`: text handler
- `src/shapes/registry.ts`: shape registry
- `src/store/canvasStore.ts`: 轻量 store 与基础 actions
- `src/store/history/history.ts`: undo/redo 历史栈
- `src/ui/components/CanvasRoot.tsx`: 画布挂载点
- `src/ui/toolbar/Toolbar.tsx`: 顶部工具栏
- `src/ui/panels/SidePanel.tsx`: 右侧状态面板
- `src/ui/hooks/useCanvasStore.ts`: store 订阅 hooks
- `src/types/canvas.ts`: 画布领域类型
- `src/utils/id.ts`: id 生成工具
- `src/utils/store.ts`: 可复用的轻量 store

### `persistence/`
- IndexedDB 自动保存与恢复
- 处理版本迁移与节流写入

### `types/` 与 `utils/`
- 共享类型与通用工具函数
