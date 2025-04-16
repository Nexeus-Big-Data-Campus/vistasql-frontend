import React, { useMemo, useState } from 'react';
import { Background, Controls, ReactFlow, ReactFlowInstance, XYPosition } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Query } from '../../interfaces/query';
import QueryNode from './nodes/QueryNode';
import dagre from '@dagrejs/dagre';
import JoinNode from './nodes/JoinNode';
import { Join } from '../../interfaces/join';
import ReferenceNode from './nodes/ReferenceNode';
import { Reference } from '../../interfaces/reference';
import { Alert } from '@mui/material';

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

    const [flowInstance, setFLowInstance] = useState<ReactFlowInstance<any, any> | undefined>();
    
    // TODO: Improve this function to calculate node size based on content
    const getNodeSize = (node: FlowNode): {width: number, height: number} => {
        switch(node.type) {
            case 'query':
                const query = node.data as Query;
                const height = (query.fields.length * 15) + 60;
                return {width: 200, height};
            case 'join':
                return {width: 200, height: 50};
            case 'reference':
                const reference = node.data as Reference;
                return {width: reference.name.length * 7.5, height: 50};
            default:
                return {width: 200, height: 50};
        }
    }
    
    const buildLayout = (flowNodes: FlowNode[]) : {nodes: FlowNode[], edges: any[]} => {
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
        if (!queryTree) {
            return {nodes: [], edges: []};
        }

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

    function emptyQueryAlert() {
        if(nodes.length === 0) {
            return (
                <Alert severity='info'>Type your Query in the editor to update the visualization.</Alert>
            )
        }
    }

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            onInit={(instance) => setFLowInstance(instance)}
            onNodesChange={() => flowInstance?.fitView()}
        >
            {emptyQueryAlert()}

            <Controls showInteractive={false}></Controls>
            <Background></Background>
        </ReactFlow>
    )
}