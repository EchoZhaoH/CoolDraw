# Control 模块设计文档

## 目标
为选中的 shape 提供可交互的 controls（缩放/旋转），支持单选与多选的基础操作，并与现有渲染/交互架构保持解耦与可扩展。

## 范围
- 仅支持节点级别的缩放与旋转
- 单选显示完整 controls，多选显示外框与统一缩放
- 拖拽中仅预览更新，结束时一次性提交历史

## 核心概念
### Control
Control 是挂在 shape 上的交互手柄集合（handles），包括：
- Scale handles：四角/四边
- Rotate handle：顶部外扩点
- Bounding box：选中框

### 控制层结构
- 控制层渲染与事件命中独立于 shape 本体
- 控制层随 viewport 变换，但不参与 shape hitTest

## 模块结构（建议）
```
src/controls/
  types.ts
  registry.ts
  controller.ts
  renderer.ts
  utils.ts
```

## 数据模型
### types.ts（建议）
- ControlTarget
  - type: "node"
  - id: string
  - bounds: Rect
  - rotation?: number
- ControlHandle
  - id: string
  - type: "scale" | "rotate"
  - position: Point
  - cursor: string
  - meta?: { axis?: "x" | "y" | "both"; anchor?: "nw" | "ne" | ... }
- ControlState
  - active: boolean
  - targetId?: string
  - handleId?: string
  - startPointer?: Point
  - startBounds?: Rect
  - startRotation?: number

## 交互流程
### 1) 命中测试
- pointerDown 优先检查 control handles
- 命中则进入 control drag session

### 2) 变换计算
- Scale：基于起始 bbox 与指针位移计算新的 width/height
- Rotate：以 bbox 中心为旋转中心，计算 startAngle -> currentAngle

### 3) 预览与提交
- 拖拽中更新 store 的 preview（不写历史）
- pointerUp 提交最终状态（写历史）

## 渲染策略
- controls 渲染在 overlayLayer
- 控制层从 selection 推导：选中节点 -> 计算 bbox -> 生成 handles
- 使用统一样式配置：handleSize、stroke、fill、padding、rotateOffset

## 与现有架构集成
### Renderer
- 在 `PixiRenderer.renderOverlay` 中加入 controls 绘制
- 或独立 `ControlRenderer`，由 `CanvasEngine` 挂载到 overlayLayer

### Store
- 在 `canvasStore` 中新增：
  - `actions.updateNodeTransformPreview`
  - `actions.updateNodeTransformCommit`
- 复用现有 history 机制（预览不入历史）

### CanvasRoot
- 指针事件中加入 control 命中逻辑
- 控制状态放在 `controlSessionRef`

## 关键算法
- bbox 计算：基于 shape.getBounds
- 旋转：`angle = atan2(pointer.y - center.y, pointer.x - center.x)`
- 缩放：根据 handle 方向锁定 x/y 或保持等比

## 视觉规范（建议）
- 选中框：蓝色描边，透明填充
- Scale handles：白底蓝边，圆角
- Rotate handle：小圆点 + 连接线

## 风险与注意
- 旋转后 bbox 命中需要考虑包围盒与实际形状差异
- 多选缩放时需统一变换中心与比例
- 需要避免与现有拖拽移动行为冲突（优先处理 control）

## 验收标准
- 单选节点可拖拽缩放/旋转，操作流畅
- 多选节点出现统一控制框，缩放后相对位置不漂移
- 历史记录：一次拖拽仅产生一条历史记录
