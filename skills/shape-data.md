# Whiteboard Shape Data Skill

## Purpose
Explain the shape data model used by the whiteboard so an AI can read, create, and update shapes consistently.

## Core Types
### BaseShape
- id: string, unique identifier
- type: string, shape type key
- position: { x, y }, top-left position
- size: { width, height }
- rotation?: number (radians)
- style?: StyleProps
- data?: Record<string, unknown>
- meta?: { locked, hidden, createdAt, updatedAt, schemaVersion }

### GeometryShape
- type: "geometry"
- kind: "rect" | "ellipse"
- style?: StyleProps & { cornerRadius?: number }

### TextShape
- type: "text"
- data?: { text?: string; fontSize?: number; fontFamily?: string }

### ConnectorShape (Line)
- type: "connector"
- mode: "free" | "linked"
- source: ConnectorEndpoint
- target: ConnectorEndpoint
- style?: ConnectorStyle

## StyleProps
- stroke?: string (hex)
- strokeWidth?: number
- fill?: string (hex)
- opacity?: number (0-1)
- dash?: number[]
- cornerRadius?: number
- fontSize?: number
- fontFamily?: string
- textAlign?: "left" | "center" | "right"

## Connector Types
### ConnectorEndpoint
- nodeId?: string
- anchorId?: "n" | "e" | "s" | "w" | "c"
- position?: { x, y }
- offset?: { x, y }

### ArrowStyle
- type?: "none" | "triangle" | "circle" | "diamond"
- size?: number
- filled?: boolean

### ConnectorStyle
- stroke?: string (hex)
- strokeWidth?: number
- dash?: number[]
- opacity?: number (0-1)
- lineType?: "straight" | "orthogonal" | "curve"
- arrowStart?: ArrowStyle
- arrowEnd?: ArrowStyle

## Interaction Traits
Traits describe capabilities of a shape:
- draggable, resizable, rotatable, connectable, textEditable

## Behavior Notes
- position is top-left in world coordinates
- rotation is applied around shape center
- size width/height are always positive
- data is shape-specific payload

## Connector Behavior Notes
- If endpoint has `nodeId`, it is treated as linked; otherwise it is free.
- `mode` is derived from endpoints: both linked => "linked", otherwise "free".
- Linked endpoints follow node movement/rotation; free endpoints stay fixed.
- Default `lineType` is `curve`.

## Examples
### Rectangle
```json
{
  "id": "node_abc",
  "type": "geometry",
  "kind": "rect",
  "position": { "x": 120, "y": 120 },
  "size": { "width": 160, "height": 96 },
  "rotation": 0,
  "style": { "fill": "#ffffff", "stroke": "#475569", "strokeWidth": 1 }
}
```

### Ellipse
```json
{
  "id": "node_def",
  "type": "geometry",
  "kind": "ellipse",
  "position": { "x": 240, "y": 200 },
  "size": { "width": 140, "height": 140 },
  "rotation": 0
}
```

### Text
```json
{
  "id": "node_txt",
  "type": "text",
  "position": { "x": 160, "y": 300 },
  "size": { "width": 180, "height": 40 },
  "rotation": 0,
  "data": { "text": "文本", "fontSize": 16, "fontFamily": "Inter" },
  "style": { "stroke": "#0f172a" }
}
```

### Connector
```json
{
  "id": "connector_1",
  "type": "connector",
  "mode": "linked",
  "source": {
    "nodeId": "node_a",
    "anchorId": "e",
    "offset": { "x": 0, "y": 0 }
  },
  "target": {
    "nodeId": "node_b",
    "anchorId": "w"
  },
  "position": { "x": 0, "y": 0 },
  "size": { "width": 0, "height": 0 },
  "style": {
    "stroke": "#94a3b8",
    "strokeWidth": 2,
    "opacity": 0.9,
    "lineType": "curve",
    "arrowEnd": { "type": "triangle", "size": 10, "filled": true }
  }
}
```

## Connector Operations
- Create free line: set `source.position` and `target.position`.
- Bind endpoint: set `nodeId + anchorId`, clear `position`.
- Unbind endpoint: set `position` from current world point and remove `nodeId`.
