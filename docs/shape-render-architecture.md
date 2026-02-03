# Shape 渲染架构设计

## 目标
抽取 `geometry` 与 `text` 渲染的共同逻辑，形成通用的容器渲染管线，减少重复代码并保持增量渲染能力。

## 共同点总结
两类 shape 的渲染流程相同点：
- 从 `RenderContext` 读取 `nodesLayer` 与 `viewCache`
- 复用或创建 `Container`
- 统一设置 `pivot/position/rotation`
- 设置 `eventMode` 与 `cursor`
- 将容器挂载到 `nodesLayer` 并写回 `viewCache`
- 仅内容绘制（`Graphics`/`Text`）存在差异

## 架构设计
### 通用渲染工具
新增 `src/shapes/render/nodeView.ts`，提供统一的容器创建与复用逻辑。

核心职责：
- 校验 `RenderContext`（`nodesLayer`、`viewCache`）
- 复用或创建 `Container`
- 设置 `pivot/position/rotation`
- 统一设置 `eventMode` 与 `cursor`
- 自动挂载与缓存写回

### Shape 渲染分层
- **容器层**：统一处理 transform 与挂载
- **样式层**：统一处理默认样式与样式解析
- **内容层**：由各 shape 负责绘制与更新

### 样式抽象
新增 `src/shapes/render/style.ts`，统一读取默认样式并完成颜色解析：
- `getGeometryStyle`：输出 fill/stroke/strokeWidth/opacity 与解析后的颜色
- `getTextStyle`：输出文本内容、字体与颜色

## 迁移步骤
1. 新增 `nodeView.ts` 通用工具
2. 新增 `style.ts` 统一样式读取与解析
3. 重构 `geometry.ts` 调用通用工具，仅保留 `Graphics` 绘制
4. 重构 `text.ts` 调用通用工具，仅保留 `Text` 内容更新

## 验证点
- 复用 `viewCache` 时无重复容器
- 旋转/缩放/拖拽与选中渲染行为不变
- 节点更新时无闪烁
