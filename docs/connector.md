# Connector/Line 设计文档

## 目标
- Line 与 Connector 统一为一种 shape
- 支持自由线与锚点绑定两种模式
- 支持箭头样式、线样式、曲线类型
- 节点位置/尺寸/旋转变化时自动更新连接

## 数据结构
```ts
type ConnectorShape = {
  id: string;
  type: "connector";
  mode: "free" | "linked";
  source: Endpoint;
  target: Endpoint;
  style?: ConnectorStyle;
  data?: Record<string, unknown>;
};

type Endpoint = {
  nodeId?: string;
  anchorId?: string;
  position?: { x: number; y: number };
  offset?: { x: number; y: number };
};

type ConnectorStyle = {
  stroke?: string;
  strokeWidth?: number;
  dash?: number[];
  opacity?: number;
  lineType?: "straight" | "orthogonal" | "curve";
  arrowStart?: ArrowStyle;
  arrowEnd?: ArrowStyle;
};

type ArrowStyle = {
  type?: "none" | "triangle" | "circle" | "diamond";
  size?: number;
  filled?: boolean;
};
```

## 端点解析规则
- `mode: "linked"` 时优先使用 `nodeId + anchorId`
- 未命中锚点时降级到节点边界投影点
- `mode: "free"` 时使用 `position`
- `offset` 作用在锚点坐标上

## 锚点与旋转
- shape handler 暴露 `getAnchors(shape)`，返回锚点列表
- 若节点有 `rotation`，锚点坐标需围绕中心旋转

## 渲染规则
- 使用 endpoints 解析后的世界坐标
- `lineType` 默认 `curve`
- `stroke/dash/opacity` 由 style 驱动
- 绘制箭头：基于路径切线方向

## 交互规则
- 命中优先级：端点 > 线段
- 拖拽端点：命中锚点则绑定并进入 `linked`
- 释放空白：进入 `free` 并记录 `position`

## 与节点变化的关系
- 节点移动/缩放/旋转时，绑定端点自动更新
- connector 不缓存世界坐标，只存逻辑绑定

## 验收标准
- 拖拽端点可切换绑定/自由
- 节点变换时连接线跟随更新
- 箭头/线样式渲染正确
