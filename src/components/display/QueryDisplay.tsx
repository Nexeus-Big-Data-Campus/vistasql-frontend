import React from 'react';
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { QueryNode } from '../../interfaces/query';

interface Props {
    queryTree: QueryNode
}

export default function QueryDisplay({ queryTree }: Props) {

    if (!queryTree || !queryTree.hash) {
        return <div className="mt-3">Type your query to start...</div>
    }

    return (
        <ReactFlow

        ></ReactFlow>
    )
}