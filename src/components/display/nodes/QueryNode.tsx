import { Handle, Position } from '@xyflow/react';
import React from 'react';
import { Query } from '../../../interfaces/query';
import { Chip } from '@mui/material';

interface Props {
    data: Query;
}

export default function QueryNode({ data }: Props) {
    const { name, fields, type } = data;

    return (
        <div className="rounded-t overflow-hidden border-1">
            <Handle type="target" position={Position.Left} id={'target'}/>
            <Handle type="source" position={Position.Right} id={'source'}/>
            <header className='p-2 bg-black flex items-center justify-between'>
                <span className='text-xl text-white'>SELECT</span>
                <Chip label={type} className='ml-6 !bg-gray-200 !text-xs'></Chip>
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