import { Handle, Position, useReactFlow } from '@xyflow/react';
import React, { useState } from 'react';
import { Query } from '../../../interfaces/query';
import { Field } from '../../../interfaces/field';
import { EDGE_HIGHLIGHT_CLASS, FIELD_HIGHLIGHT_CLASS } from '../QueryDisplay';

function TypeLabel({ type }: { type: string }) {
    if (type === 'statement') return;

    return (
        <span className='text-[0.65rem] p-1 bg-gray-200 rounded-2xl ml-6'>{type}</span>
    );
}

interface Props {
    data: Query;
    resetHighlight: () => void;
}

export default function QueryNode({ data, resetHighlight }: Props) {
    const { id, name, fields, type } = data;
    const { setEdges } = useReactFlow();

    const onFieldClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, field: Field, index: number) => {
        event.stopPropagation();
        resetHighlight();
        highlightField(field.id);
        highlightEdges(field);
    }

    const highlightField = (fieldId: string) => {
        document.querySelectorAll(`[data-fieldid="${fieldId}"]`).forEach((field) => {
            field.classList.add(FIELD_HIGHLIGHT_CLASS);
        });
    };

    const highlightEdges = (field: Field) => {
        setEdges((prevEdges) => {
            const updated = prevEdges.map((e) => {
                const isOriginEdge = field.origin.reduce((acum, origin) => {
                    return acum || e.id.startsWith(`${origin}`);
                }, false);

                if (!isOriginEdge) {
                    return {
                        ...e,
                        animated: false,
                        className: ''
                    };
                }

                return {
                    ...e,
                    animated: true,
                    className: EDGE_HIGHLIGHT_CLASS,
                };
            });

            return updated;
        });
    }

    return (
        <div className="rounded-t-xs overflow-hidden border-1 bg-gray-900">
            <Handle type="target" position={Position.Left} id={'target'} />
            <Handle type="source" position={Position.Right} id={'source'} />
            <header className='py-1 px-2 bg-gray-900 flex items-center justify-between'>
                <span className='text-xl text-white'>{name}</span>
                <TypeLabel type={type}></TypeLabel>
            </header>
            <section className='text-sm bg-white'>
                {fields.map((field, index) => (
                    <div data-fieldid={field.id} key={index} tabIndex={index} className="text-xs p-1 border-b border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={(event) => onFieldClick(event, field, index)}>
                        {field.alias}
                    </div>
                ))}
            </section>
        </div>
    );
}