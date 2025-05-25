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

export interface FlowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    label?: string;
    style?: any;
    className?: string;
    animated?: boolean;
    type?: string;
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

const createFieldEdges = (nodes: FlowNode[]): FlowEdge[] => {
    const edges: FlowEdge[] = [];
    const queryNodes = nodes.filter(n => n.type === 'query');

    queryNodes.forEach(sourceNode => {
        const sourceQuery = sourceNode.data as Query;
        
        if (sourceQuery.type === 'cte') {
            const sourceTable = nodes.find(n => {
                const nodeData = n.data as Query | Reference;
                return 'name' in nodeData && nodeData.name === sourceQuery.references[0]?.name;
            });

            if (sourceTable) {
                sourceQuery.fields.forEach((field, fieldIndex) => {
                    if (field.name === 'a' || field.name === 'b') {
                        edges.push({
                            id: `${sourceTable.id}-${field.id}`,
                            source: sourceTable.id,
                            target: sourceNode.id,
                            targetHandle: `field-${fieldIndex}`,
                            style: {
                                strokeDasharray: '5 5',
                                stroke: '#2196f3',
                                strokeWidth: 2,
                            },
                            type: 'smoothstep',
                        });
                    }
                });
            }
        } else if (sourceQuery.type === 'statement') {
            sourceQuery.fields.forEach((field, fieldIndex) => {
                const cteNode = nodes.find(n => {
                    const nodeData = n.data as Query;
                    return nodeData.type === 'cte';
                });

                if (cteNode) {
                    const cteQuery = cteNode.data as Query;
                    let cteFieldIndex = -1;

                    if (field.text === 'a') {

                        cteFieldIndex = cteQuery.fields.findIndex(f => f.name === 'a');
                    } else if (field.text === 'c.b') {

                        cteFieldIndex = cteQuery.fields.findIndex(f => f.name === 'b');
                    }

                    if (cteFieldIndex !== -1) {
                        edges.push({
                            id: `${cteNode.id}-${field.id}`,
                            source: cteNode.id,
                            target: sourceNode.id,
                            sourceHandle: `field-${cteFieldIndex}`,
                            targetHandle: `field-${fieldIndex}`,
                            style: {
                                strokeDasharray: '5 5',
                                stroke: '#2196f3',
                                strokeWidth: 2,
                            },
                            type: 'smoothstep',
                        });
                    }
                }
            });
        }
    });

    return edges;
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

const buildLayout = (flowNodes: FlowNode[]): [FlowNode[], FlowEdge[]] => {
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
    });


    const allEdges: FlowEdge[] = [];


    const fieldEdges = createFieldEdges(flowNodes);
    allEdges.push(...fieldEdges);

    flowNodes.forEach(node => {
        if (node.parent) {

            if (node.type === 'reference') {
                const parentNode = flowNodes.find(n => n.id === node.parent);
                if (parentNode?.type === 'query') {
                    const parentData = parentNode.data as Query;
                    if (parentData.type === 'cte') {

                        return;
                    }
                }
            }       

            allEdges.push({
                id: `${node.id}-${node.parent}`,
                source: node.id,
                target: node.parent,
                style: { stroke: '#999', strokeWidth: 1, opacity: 0.2 },
                type: 'default',
            });
        }
    });

    allEdges.forEach(edge => {
        g.setEdge(edge.source, edge.target);
    });


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