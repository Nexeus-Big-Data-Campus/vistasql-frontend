import React, { useEffect, useMemo, useState } from 'react';
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, ReactFlowInstance, ReactFlowProvider, useEdgesState, useNodesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Query } from '../../interfaces/query';
import QueryNode from './nodes/QueryNode';
import JoinNode from './nodes/JoinNode';
import ReferenceNode from './nodes/ReferenceNode';
import { ARROW_MARKER, FlowNode, useQueryFlow } from '../../hooks/useQueryFlow';
import { loadTreeSitterParser } from '../../services/parsers/queryParser';

export const FIELD_HIGHLIGHT_CLASS = 'highlight-field';
export const EDGE_HIGHLIGHT_CLASS = 'highlight-edge';
export const EDGE_AMBIGUOUS_CLASS = 'highlight-ambiguous-edge';

interface Props {
    queryTree: Query[],
    options: QueryDisplayOptions,
}

export interface QueryDisplayOptions {
    hideMinimap?: boolean,
    hideControls?: boolean,
    minZoom?: number,
}

const defaultOptions: QueryDisplayOptions = {
    hideMinimap: false,
    hideControls: false,
    minZoom: 0.5,
}

export default function QueryDisplay({ queryTree, options }: Props) {
    const [flowInstance, setFLowInstance] = useState<ReactFlowInstance<any, any> | undefined>();
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [nodes, setNodes] = useNodesState([]);
    const { nodes: memoizedNodes, edges: memoizedEdges } = useQueryFlow(queryTree);

    const nodeTypes = useMemo(() => ({
        query: (props: any) => <QueryNode {...props} resetHighlight={resetHighlight}></QueryNode>,
        join: JoinNode,
        reference: ReferenceNode
    }), []);

    useEffect(() => {
        setNodes(memoizedNodes as any);
        setEdges(memoizedEdges as any);

        options = {
            ...defaultOptions,
            ...options,
        };
    }, [memoizedNodes, memoizedEdges]);

    const onNodesChange = () => {
        flowInstance?.fitView();
    }

    const onCanvasClick = () => {
        resetEdges();
        resetHighlight();
    }

    const resetEdges = () => {
        const newEdges = edges.map((e: FlowNode) => ({
            ...e,
            animated: false,
            style: {},
            className: '',
            markerEnd: ARROW_MARKER
        }));

        setEdges(newEdges as any);
    }

    const resetHighlight = () => {
        const highlightedFields = document.getElementsByClassName(FIELD_HIGHLIGHT_CLASS);

        Array.from(highlightedFields).forEach((element: Element) => {
            element.classList.remove(FIELD_HIGHLIGHT_CLASS);
        });
    };

    function nodeColor(node: any) {
        switch (node.type) {
            case 'query':
                return '#1976d2';  
            default: 
                return '#d2c019';
        }
    }

    return (
        <ReactFlowProvider>
            <ReactFlow
                id='query-display'
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                onInit={(instance) => setFLowInstance(instance as any)}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onClick={onCanvasClick}
                minZoom={options.minZoom ?? defaultOptions.minZoom}
            >
                {!options.hideControls && 
                    <Controls showInteractive={false}></Controls>
                }
                <Background variant={BackgroundVariant.Lines}></Background>
                {nodes.length > 0 && !options.hideMinimap &&
                    <MiniMap
                    key={`minimap-${nodes.length}`}
                    nodeColor={nodeColor}
                    nodeStrokeWidth={2}
                    zoomable
                    pannable
                />}
            </ReactFlow>
        </ReactFlowProvider>
    )
}