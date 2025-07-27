import { useMemo } from 'react';
import dagre from '@dagrejs/dagre';
import { EdgeMarker, MarkerType, XYPosition } from '@xyflow/react';
import { Query, ObjectReference, ObjectReferenceType } from '../interfaces/query';
import { Join } from '../interfaces/join';
import { Field, FieldOrigin, FieldReference } from '../interfaces/field';

//TODO: MOVE TO INTERFACE FILE
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
    markerEnd: EdgeMarker
}

export const ARROW_MARKER: EdgeMarker = {
    type: MarkerType.ArrowClosed,
    width: 15,
    height: 15,
    strokeWidth: 1
}

export const ARROW_MARKER_HIGHLIGHT: EdgeMarker = {
    type: MarkerType.ArrowClosed,
    width: 9,
    height: 9,
    strokeWidth: 1,
    color: '#1976d2',
}

const getMaxFieldLength = (maxLength: number, field: Field): number => {
    return Math.max(field.alias.length, maxLength); 
}

const getAllFields = (query: Query): Field[] => {
    return query.selectClause.fields.concat(...query.unionClauses.map(uc => uc.selectClause.fields));
}

const getNodeSize = (node: FlowNode): { width: number; height: number } => {
    switch (node.type) {
        case FlowNodeType.Query:
            const query = node.data as Query;
            const allFields = getAllFields(query);
            const height = (allFields.length * 40) + 50;
            const maxWidthField = allFields.reduce(getMaxFieldLength, 0);
            const contentMaxWidth = Math.max(maxWidthField, query.name.length);
            return { width: (contentMaxWidth * 12) + 50, height };
        case FlowNodeType.Join:
            return { width: 80, height: 50 };
        case FlowNodeType.Reference:
            const reference = node.data as ObjectReference;
            return { width: (reference.name.length * 12) + 50, height: 40 };
        default:
            return { width: 200, height: 100 };
    }
};

const getQueryNode = (node: Query, parentHash?: string): FlowNode =>  {
    return {
        id: `${node.id}`,
        type: FlowNodeType.Query,
        data: node,
        parent: parentHash,
        position: { x: 0, y: 0 },
        edgelLabel: node.alias ?? undefined
    }
}

const getJoinNode = (join: Join, parentHash?: string): FlowNode => {
    return {
        id: `${join.id}`,
        type: FlowNodeType.Join,
        data: join,
        parent: parentHash,
        position: { x: 0, y: 0 },
        edgelLabel: join.predicate,
    }
}

const getJoinReferenceTableNode = (reference: ObjectReference, parentHash?: string): FlowNode => {
    return {
        id: `${reference.id}-join-ref`,
        type: FlowNodeType.Reference,
        data: reference,
        parent: parentHash,
        position: { x: 0, y: 0 },
        edgelLabel: reference.alias,
    }
}

const getJoinReferenceNode = (reference: ObjectReference, parentHash?: string): FlowNode[] => {
    switch (reference.type) {
        case ObjectReferenceType.SUBQUERY:
            return getAllNodesFromTree(reference.ref as Query);
        case ObjectReferenceType.TABLE:
            return [getJoinReferenceTableNode(reference, parentHash)];
        default:
            return [];
    }
}

const getReferenceNode = (reference: ObjectReference, parentHash?: string): FlowNode[] => {
    switch (reference.type) {
        case ObjectReferenceType.SUBQUERY:
            return getAllNodesFromTree(reference.ref as Query);
        case ObjectReferenceType.TABLE:
            return [getTableNode(reference, parentHash)];
        default:
            return [];
    }
}

const getTableNode = (reference: ObjectReference, parentHash?: string): FlowNode => {
    return {
        id: `${reference.id}`,
        type: FlowNodeType.Reference,
        data: reference,
        parent: parentHash,
        position: { x: 0, y: 0 },
        edgelLabel: reference.alias,
    }
}

const getAllNodesFromTree = (node: Query, parentHash?: string): FlowNode[] => {
    const treeNodes: FlowNode[] = [];

    // Add root node
    treeNodes.push(getQueryNode(node, parentHash));

    node.cte.forEach((child) => {
        treeNodes.push(...getAllNodesFromTree(child, `${node.id}`));
    });

    node.joins.forEach((join) => {
        treeNodes.push(getJoinNode(join, node.id));
        treeNodes.push(...getJoinReferenceNode(join.source, join.id));
    });

    node.fromClause.references.forEach((reference) => {
        if (reference.ref) {
            return;
        }
        
        treeNodes.push(...getReferenceNode(reference, node.id));
    });

    /* node.unionClauses.forEach(union => {
        treeNodes.push(...getAllNodesFromTree(union, `${node.id}`));
    }); */

    return treeNodes;
};

const buildLayout = (flowNodes: FlowNode[], edges: any[]): FlowNode[] => {
    const g = new dagre.graphlib.Graph();

    g.setGraph({
        rankdir: 'LR',
        align: 'UR',
        nodesep: 150,
        ranksep: 250,
    });

    flowNodes.forEach((node) => {
        const size = getNodeSize(node);
        g.setNode(node.id, size);
    });

    edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target, {
            label: edge.edgelLabel,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
        });
    });

    dagre.layout(g);
    const graphNodes = flowNodes.map((node) => {
        const nodeWithPosition = g.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x,
                y: nodeWithPosition.y,
            },
            width: nodeWithPosition.width,
            height: nodeWithPosition.height,
        };
    });

    return graphNodes;
};

const getEdgesFromFields = (fields: Field[], targetId: string): FlowEdge[] => {
    const edges: FlowEdge[] = [];

    fields.forEach((field: Field) => {
        const fieldId = field.id;
        field.references.forEach((ref: FieldReference, i: number) => {
            /* if (ref.origin === FieldOrigin.JOIN) {
                return;
            } */

            const sourceHandle = ref.origin !== FieldOrigin.CTE ? 'source' : `${ref.fieldId}-source`;
            const edge: FlowEdge = {
                id: `${ref.fieldId}-${fieldId}-${i}`,
                source: `${ref.nodeId}`,
                target: targetId,
                sourceHandle: sourceHandle,
                targetHandle: `${fieldId}-target`,
                markerEnd: ARROW_MARKER
            };
            edges.push(edge);
        });
    });

    return edges;
}

const getEdgesFromJoins = (joins: Join[], node: FlowNode): FlowEdge[] => {
    const edges: FlowEdge[] = [];

    joins.forEach((join: Join) => {
        const source = join.source;
        if (source.type === ObjectReferenceType.TABLE) {
            edges.push({
                id: `${join.source.id}-${join.id}`,
                source: `${join.source.id}-join-ref`,
                target: `${join.id}`,
                sourceHandle: 'source',
                targetHandle: 'target',
                markerEnd: ARROW_MARKER
            });
        } else if (source.type === ObjectReferenceType.SUBQUERY || source.type === ObjectReferenceType.CTE) {
            source.ref?.selectClause.fields.forEach(field => {
                edges.push({
                    id: `${source.ref?.id}-${field.id}`,
                    source: `${source.ref?.id}`,
                    target: `${join.id}`,
                    sourceHandle: `${field.id}-source`,
                    targetHandle: `target`,
                    markerEnd: ARROW_MARKER
                });
            });
        }
    });

    return edges;
}

const getEdgesFromUnions = (unions: Query[], parent: FlowNode): FlowEdge[] => {
    return unions.reduce((fields, union) => {
        const unionEdges: FlowEdge[] = getEdgesFromFields(union.selectClause.fields, parent.id);
        return fields.concat(unionEdges);
    }, [] as FlowEdge[]);
}

const getEdgesFromQueryNode = (node: FlowNode): FlowEdge[] => {
    const data = node.data as Query;
    const fields = data.selectClause?.fields ?? [];
    const joins = data.joins ?? [];
    const unions = data.unionClauses ?? [];
    const edges: FlowEdge[] = [];
    
    edges.push(...getEdgesFromFields(fields, node.id));
    edges.push(...getEdgesFromJoins(joins, node));
    edges.push(...getEdgesFromUnions(unions, node));
    
    return edges;
}

export const useQueryFlow = (queryTree: Query[]) => {
    const getAllEdgesFromTree = (nodes: FlowNode[]) => {
        return nodes.reduce((acc: FlowEdge[], node: FlowNode) => {
            switch(node.type) {
                case FlowNodeType.Query:
                    acc.push(...getEdgesFromQueryNode(node));
                    break;
                default:
                    break;
            }

            return acc;
        }, []);
    }

    const [nodes, edges] = useMemo(() => {
        if (!queryTree) {
            return [[], []];
        }

        const allNodes = queryTree.map((node) => getAllNodesFromTree(node)).flat();
        const allEdges = getAllEdgesFromTree(allNodes);
        const graphNodes = buildLayout(allNodes, allEdges);

        return [graphNodes, allEdges];
    }, [queryTree]);

    return { nodes, edges };
};