import { Handle, Position } from '@xyflow/react';
import React from 'react';
import { QueryNode } from '../../../interfaces/query';

interface Props {
    query: QueryNode;
}

export default function QueryFlowNode({ query }: Props) {
    const { name } = query;

    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div>
                <span>{name}</span>
            </div>
        </>
    );
}