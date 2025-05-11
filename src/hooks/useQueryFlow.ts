import { useMemo } from 'react';
import dagre from '@dagrejs/dagre';
import { XYPosition } from '@xyflow/react';
import { Query } from '../interfaces/query';
import { Join } from '../interfaces/join';
import { Reference } from '../interfaces/reference';

//TODO: MOVE TO INTERFACE FILE
export interface FlowNode {
    id: string;
    type: string;
    data: Query | Join | Reference;
    position: XYPosition;
    parent?: string;
    edgelLabel?: string;
}

const getNodeSize = (node: FlowNode): { width: number; height: number } => {
    switch (node.type) {
        case 'query':
            const query = node.data as Query;
            const height = query.fields.length * 15 + 60;
            return { width: 200, height };
        case 'join':
            return { width: 200, height: 50 };
        case 'reference':
            const reference = node.data as Reference;
            return { width: reference.name.length * 7.5, height: 50 };
        default:
            return { width: 200, height: 50 };
    }
};

const flattenQueryTree = (node: Query, parentHash?: string): FlowNode[] => {
    const treeNodes: FlowNode[] = [];

    // Add root node
    treeNodes.push({
        id: `${node.id}`,
        type: 'query',
        data: node,
        parent: parentHash,
        position: { x: 0, y: 0 },
        edgelLabel: node.alias ?? undefined
    });

    node.children.forEach((child) => {
        treeNodes.push(...flattenQueryTree(child, `${node.id}`));
    });

    node.joins.forEach((join) => {
        const id = `${join.id}`;
        treeNodes.push({
            id,
            type: 'join',
            data: join,
            parent: `${node.id}`,
            position: { x: 0, y: 0 },
            edgelLabel: join.predicate,
        });

        const reference = { name: join.source, alias: join.alias } as Reference;
        treeNodes.push({
            id: `${id}-join-ref`,
            type: 'reference',
            data: reference,
            parent: id,
            position: { x: 0, y: 0 },
            edgelLabel: reference.alias,
        });
    });

    const newReferences = node.references.filter((ref) => {
        return !node.children.reduce((acum, child) => acum || child.name === ref.name, false);
    });

    newReferences.forEach((reference) => {
        treeNodes.push({
            id: `${reference.id}`,
            type: 'reference',
            data: reference,
            parent: `${node.id}`,
            position: { x: 0, y: 0 },
            edgelLabel: reference.alias,
        });
    });

    return treeNodes;
};

const buildLayout = (flowNodes: FlowNode[], edges: any[]): FlowNode[] => {
    const g = new dagre.graphlib.Graph();

    g.setGraph({
        rankdir: 'LR',
        nodesep: 100,
        ranksep: 100,
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
        };
    });

    return graphNodes;
};

export const useQueryFlow = (queryTree: Query[]) => {
    
    const getAllEdgesFromTree = (nodes: FlowNode[]) => {
        return nodes.reduce((acc: any[], node) => {
            const data = node.data as any;
            const fields = data.fields ?? [];
            if (fields) {
                fields.forEach((field: any) => {
                    const fieldId = field.id;
                    const fieldReferences = field.references?.resolvedFieldIds ?? [];
                    const fieldNodeIds = field.references?.nodeIds ?? [];
                    fieldReferences.forEach((ref: string, i: number) => {
                        const edge = {
                            id: `${ref}-${fieldId}`,
                            source: `${fieldNodeIds[i]}`,
                            target: node.id,
                            sourceHandle: `${ref}-source`,
                            targetHandle: `${fieldId}-target`,
                        };

                        console.log('edge', edge);
                        acc.push(edge);
                    });
                });
            }

                return acc;
        }, []);
    }

    const [nodes, edges] = useMemo(() => {
        if (!queryTree) {
            return [[], []];
        }

        const allNodes = queryTree.map((node) => flattenQueryTree(node)).flat();
        const allEdges = getAllEdgesFromTree(allNodes);
        const graphNodes = buildLayout(allNodes, allEdges);

        return [graphNodes, allEdges];
    }, [queryTree]);

    return { nodes, edges };
};