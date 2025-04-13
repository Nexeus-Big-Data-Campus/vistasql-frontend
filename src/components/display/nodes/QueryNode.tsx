import { Handle, Position } from '@xyflow/react';
import React from 'react';
import { Query } from '../../../interfaces/query';

interface Props {
    data: Query;
}

export default function QueryNode({ data }: Props) {
    const { name, fields } = data;

    return (
        <div className="rounded-t overflow-hidden border-1">
            <Handle type="target" position={Position.Left} id={'a'}/>
            <Handle type="source" position={Position.Right} id={'b'}/>
            <header className='px-2 bg-black'>
                <span className='text-sm text-white'>{name}</span>
            </header>
            <section className='text-sm bg-white'>
                {fields.map((field, index) => (
                    <div key={index} className={'text-xs p-1 border-b border-gray-300'}>
                        {field}
                    </div>
                ))}
            </section>
        </div>
    );
}