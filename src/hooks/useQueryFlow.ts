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

    // Add root node with unique ID
    const rootNodeId = parentHash ? `${parentHash}-${node.id}` : `${node.id}`;
    treeNodes.push({
        id: rootNodeId,
        type: 'query',
        data: node,
        parent: parentHash,
        position: { x: 0, y: 0 },
        edgelLabel: node.alias ?? undefined
    });

    // Add children with unique IDs
    node.children.forEach((child, index) => {
        treeNodes.push(...flattenQueryTree(child, rootNodeId));
    });

    // Add joins with unique IDs
    node.joins.forEach((join, index) => {
        const joinId = `${rootNodeId}-join-${index}-${join.id}`;
        treeNodes.push({
            id: joinId,
            type: 'join',
            data: join,
            parent: rootNodeId,
            position: { x: 0, y: 0 },
            edgelLabel: join.predicate,
        });

        const reference = { name: join.source, alias: join.alias } as Reference;
        treeNodes.push({
            id: `${joinId}-ref-${index}`,
            type: 'reference',
            data: reference,
            parent: joinId,
            position: { x: 0, y: 0 },
            edgelLabel: reference.alias,
        });
    });

    // Add references with unique IDs
    const newReferences = node.references.filter((ref) => {
        return !node.children.reduce((acum, child) => acum || child.name === ref.name, false);
    });

    newReferences.forEach((reference, index) => {
        treeNodes.push({
            id: `${rootNodeId}-ref-${index}-${reference.id}`,
            type: 'reference',
            data: reference,
            parent: rootNodeId,
            position: { x: 0, y: 0 },
            edgelLabel: reference.alias,
        });
    });

    return treeNodes;
};

const buildLayout = (flowNodes: FlowNode[]): [FlowNode[], any[]] => {
    const allEdges: any[] = [];
    const g = new dagre.graphlib.Graph();
    g.setGraph({
        rankdir: 'LR',
        nodesep: 100,
        ranksep: 100,
    });
    g.setDefaultEdgeLabel(() => ({}));

    flowNodes.forEach((node) => {
        const size = getNodeSize(node);
        g.setNode(node.id, size);
        
        if (node.parent) {
            g.setEdge(node.id, node.parent);
            allEdges.push({
                id: `${node.id}-${node.parent}`,
                source: node.id,
                target: node.parent,
                label: node.edgelLabel,
                sourceHandle: 'source',
                targetHandle: 'target'
            });
        }
    });

    if (g.nodeCount() === 1) {
        return [flowNodes, []];
    }

    dagre.layout(g);
    flowNodes.forEach((node) => {
        const nodeWithPosition = g.node(node.id);
        node.position = {
            x: nodeWithPosition.x,
            y: nodeWithPosition.y,
        };
    });

    return [flowNodes, allEdges];
};

export const useQueryFlow = (queryTree: Query[]) => {
    const [nodes, edges] = useMemo(() => {
        if (!queryTree) {
            return [[], []];
        }

        const allNodes = queryTree.map((node) => flattenQueryTree(node)).flat();
        return buildLayout(allNodes);
    }, [queryTree]);

    return { nodes, edges };
};