export enum FlowNodeType {
    Query = 'query',
    Join = 'join',
    Reference = 'reference'
}

export interface FlowNode {
    id: string;
    type: FlowNodeType;
    data: Query | Join | ObjectReference;
    position: XYPosition;
    parent?: string;
    edgelLabel?: string;
    width?: number;
    height?: number;
}

export interface FlowEdge {
    id: string,
    source: string,
    target: string,
    sourceHandle: string,
    targetHandle: string,
    markerEnd: EdgeMarker,
    minLnegth?: number;
}