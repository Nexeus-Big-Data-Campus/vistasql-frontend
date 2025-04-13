import React, { useMemo } from 'react';
import { Background, ReactFlow, XYPosition } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Query } from '../../interfaces/query';
import QueryNode from './nodes/QueryNode';
import dagre from '@dagrejs/dagre';

const nodeTypes = {
    query: QueryNode,
}

interface FlowNode {
    id: string;
    type: 'query';
    data: Query;
    position: XYPosition;
    parent?: string;
}

interface Props {
    queryTree: Query
}

export default function QueryDisplay({ queryTree }: Props) {
    const buildLayout = (flowNodes: FlowNode[]) : {nodes: FlowNode[], edges: any[]} => {
        const allEdges: any[] = [];
        const g = new dagre.graphlib.Graph();
        g.setGraph({rankdir: 'LR'});
        g.setDefaultEdgeLabel(() => ({}));

        flowNodes.forEach((node) => {
            g.setNode(node.id, { width: 200, height: 50 });     
            if(node.parent) {
                g.setEdge(node.id, node.parent);
                allEdges.push({id: `${node.id}-${node.parent}`, source: node.id, target: node.parent, sourceHandle: 'b', targetHandle: 'a'});
            }
        });

        if(g.edgeCount() === 0) {
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

            if(node.children && node.children.length > 0) {
                node.children.forEach((child) => {
                    flattenQueryTree(child, `${node.hash}`);
                });
            }            
        }

        flattenQueryTree(queryTree);
        return buildLayout(allNodes);
    }, [queryTree]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
        >
            <Background></Background>
        </ReactFlow>
    )
}