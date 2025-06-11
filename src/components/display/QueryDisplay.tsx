import React, { useEffect, useMemo, useState } from 'react';
import { Background, Controls, ReactFlow, ReactFlowInstance, ReactFlowProvider, useEdgesState, useNodesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Query } from '../../interfaces/query';
import QueryNode from './nodes/QueryNode';
import JoinNode from './nodes/JoinNode';
import ReferenceNode from './nodes/ReferenceNode';
import { Alert } from '@mui/material';
import { FlowNode, useQueryFlow } from '../../hooks/useQueryFlow';

export const FIELD_HIGHLIGHT_CLASS = 'highlight-field';
export const EDGE_HIGHLIGHT_CLASS = 'highlight-edge';

interface Props {
    queryTree: Query[]
}

function EmptyQueryAlert({queryLength} : {queryLength: number}) {
    if (queryLength > 0) return;

    return (
        <Alert severity='info'>Type your Query in the editor to update the visualization.</Alert>
    );
}

export default function QueryDisplay({ queryTree }: Props) {

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
    }, [memoizedNodes, memoizedEdges]);


    const onNodesChange = () => {
        // flowInstance?.fitView();
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
        }));

        setEdges(newEdges as any);
    }

    const resetHighlight = () => {
        const highlightedFields = document.getElementsByClassName(FIELD_HIGHLIGHT_CLASS);

        Array.from(highlightedFields).forEach((element: Element) => {
            element.classList.remove(FIELD_HIGHLIGHT_CLASS);
        });
    };

    return (
        <ReactFlowProvider>
            <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            onInit={(instance) => setFLowInstance(instance as any)}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onClick={onCanvasClick}
        >
            <EmptyQueryAlert queryLength={queryTree.length}/>
            <Controls showInteractive={false}></Controls>
            <Background></Background>
        </ReactFlow>
        </ReactFlowProvider>
    )
}