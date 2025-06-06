import { useMemo } from 'react';
import dagre from '@dagrejs/dagre';
import { XYPosition } from '@xyflow/react';
import { Query, TableReference } from '../interfaces/query';
import { Join } from '../interfaces/join';
import { Field, FieldOrigin, FieldReference } from '../interfaces/field';

export interface FlowNode {
    id: string;
    type: string;
    data: Query | Join | TableReference;
    position: XYPosition;
    parent?: string;
    edgelLabel?: string;
}

const getNodeSize = (node: FlowNode): { width: number; height: number } => {
    switch (node.type) {
        case 'query':
            const query = node.data as Query;
            const height = query.selectClause.fields.length * 15 + 60;
            return { width: 200, height };
        case 'join':
            return { width: 200, height: 50 };
        case 'reference':
            const reference = node.data as TableReference;
            return { width: reference.name.length * 7.5, height: 50 };
        default:
            return { width: 200, height: 50 };
    }
};

const flattenQueryTree = (node: Query, allCteQueries: Query[], parentHash?: string): FlowNode[] => {
    const treeNodes: FlowNode[] = [];

    
    treeNodes.push({
        id: `${node.id}`,
        type: 'query',
        data: node,
        parent: parentHash,
        position: { x: 0, y: 0 },
        edgelLabel: node.alias ?? undefined
    });

    
    node.cte.forEach((child) => {
        treeNodes.push(...flattenQueryTree(child, allCteQueries, `${node.id}`));
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

        const reference = { name: join.source, alias: join.alias } as TableReference;
        treeNodes.push({
            id: `${id}-join-ref`,
            type: 'reference',
            data: reference,
            parent: id,
            position: { x: 0, y: 0 },
            edgelLabel: reference.alias,
        });
    });

    
    const newReferences = node.fromClause.references.filter((ref) => {
        return !allCteQueries.some(cte => cte.name === ref.name || cte.alias === ref.name);
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
            const fields = 'selectClause' in data ? data.selectClause?.fields : [];
            const joins = 'joins' in data ? data.joins : [];

            fields.forEach((field: Field) => {
                const fieldId = field.id;
                field.references.forEach((ref: FieldReference) => {
                    const sourceHandle = ref.origin !== FieldOrigin.CTE ? 'source' : `${ref.fieldId}-source`;
                    const edge = {
                        id: `${ref.fieldId}-${fieldId}`,
                        source: `${ref.nodeId}`,
                        target: node.id,
                        sourceHandle: sourceHandle,
                        targetHandle: `${fieldId}-target`,
                    };
                    acc.push(edge);
                });
            });

            joins.forEach((join: Join) => {
                const edge = {
                    id: `${node.id}-${join.id}`,
                    source: `${join.id}-join-ref`,
                    target: `${join.id}`,
                    sourceHandle: 'source',
                    targetHandle: 'target',
                };
                acc.push(edge);
            });

            return acc;
        }, []);
    }

    const [nodes, edges] = useMemo(() => {
        if (!queryTree) {
            return [[], []];
        }

        
        const getAllCtes = (queries: Query[]): Query[] => {
            let all: Query[] = [];
            queries.forEach(q => {
                
                if (q.type === 'cte') {
                    all.push(q);
                }
                if (q.cte && q.cte.length > 0) {
                    all = [...all, ...getAllCtes(q.cte)];
                }
            });
            return all;
        }
        const allCteQueries = getAllCtes(queryTree);

        
        const allNodes = queryTree.map((node) => flattenQueryTree(node, allCteQueries)).flat();
        const allEdges = getAllEdgesFromTree(allNodes);
        const graphNodes = buildLayout(allNodes, allEdges);

        return [graphNodes, allEdges];
    }, [queryTree]);

    return { nodes, edges };
};