import React, { useMemo } from 'react';
import { Background, Controls, ReactFlow, XYPosition } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Query } from '../../interfaces/query';
import QueryNode from './nodes/QueryNode';
import dagre from '@dagrejs/dagre';
import JoinNode from './nodes/JoinNode';
import { Join } from '../../interfaces/join';
import ReferenceNode from './nodes/ReferenceNode';
import { Reference } from '../../interfaces/reference';

const nodeTypes = {
    query: QueryNode,
    join: JoinNode,
    reference: ReferenceNode
}

interface FlowNode {
    id: string;
    type: 'query' | 'join' | 'reference';
    data: Query | Join | Reference;
    position: XYPosition;
    parent?: string;
    edgelLabel?: string;
}

interface Props {
    queryTree: Query[]
}

export default function QueryDisplay({ queryTree }: Props) {
    const buildLayout = (flowNodes: FlowNode[]) : {nodes: FlowNode[], edges: any[]} => {
        const allEdges: any[] = [];
        const g = new dagre.graphlib.Graph();
        g.setGraph({
            rankdir: 'LR',
            nodesep: 100,
            ranksep: 100,
        });
        g.setDefaultEdgeLabel(() => ({}));

        // TODO: Calculate node height based on content
        flowNodes.forEach((node) => {
            g.setNode(node.id, { width: 200, height: 50 });  

            if(node.parent) {
                g.setEdge(node.id, node.parent);
                allEdges.push({id: `${node.id}-${node.parent}`, source: node.id, target: node.parent, sourceHandle: 'source', targetHandle: 'target', label: node.edgelLabel});
            }
        });

        if(g.nodeCount() == 1) {
            return {nodes: flowNodes, edges: []};
        }

        dagre.layout(g);
        flowNodes.forEach((node) => {
            const nodeWithPosition = g.node(node.id);
            node.position = {
                x: nodeWithPosition.x,
                y: nodeWithPosition.y
            };
        });

        return {nodes: flowNodes, edges: allEdges};
    }
    
    const {nodes, edges} = useMemo(() => {
        const allNodes: FlowNode[] = [];
        const flattenQueryTree = (node: Query, parentHash?: string): any => {
            allNodes.push( {
                id: `${node.hash}`,
                type: 'query',
                data: node,
                parent: parentHash,
                position: { x: 0, y: 0 }
            });
            
            node.children.forEach((child) => {
                flattenQueryTree(child, `${node.hash}`);
            });

            node.joins.forEach((join) => {
                const id = `${node.hash}-${join.alias}-${join.source}`
                allNodes.push({
                    id,
                    type: 'join',
                    data: join,
                    parent: `${node.hash}`,
                    position: { x: 0, y: 0 },
                    edgelLabel: join.predicate
                });

                const reference = {name: join.source, alias: join.alias} as Reference;
                allNodes.push({
                    id: `${id}-ref-1`,
                    type: 'reference',
                    data: reference,
                    parent: id,
                    position: { x: 0, y: 0 },
                    edgelLabel: reference.alias
                });
            });

            node.references.forEach((reference) => {
                allNodes.push({
                    id: `${node.hash}-${reference.name}-${reference.alias}`,
                    type: 'reference',
                    data: reference,
                    parent: `${node.hash}`,
                    position: { x: 0, y: 0 },
                    edgelLabel: reference.alias
                });
            });
        }

        queryTree.forEach((node) => {
            flattenQueryTree(node);
        });

        return buildLayout(allNodes);
    }, [queryTree]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
        >
            <Controls></Controls>
            <Background></Background>
        </ReactFlow>
    )
}