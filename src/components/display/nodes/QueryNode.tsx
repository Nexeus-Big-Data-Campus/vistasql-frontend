import { Handle, Position, useReactFlow } from '@xyflow/react';
import React from 'react';
import { Query } from '../../../interfaces/query';
import { Field } from '../../../interfaces/field';
import { EDGE_AMBIGUOUS_CLASS, EDGE_HIGHLIGHT_CLASS, FIELD_HIGHLIGHT_CLASS } from '../QueryDisplay';

function TypeLabel({ type }: { type: string }) {
    if (type === 'statement') return;

    return (
        <span className='text-[0.6rem] p-1 bg-gray-200 rounded-2xl ml-6'>{type}</span>
    );
}

function InvocationFieldLabel({ field }: { field: Field }) {
    if(!('invocationName' in field)) return;

    const invocationName = (field as any).invocationName.toUpperCase();

    return (
        <span className='text-[0.6rem] px-2 py-[0.1rem] bg-primary text-white rounded-2xl !font-normal ml-4 leading-normal'>{invocationName}</span>
    );
}

function InvocationFieldText({ field }: { field: Field }) {
    if(!('invocationName' in field)) return;

    return <span className='invocation-column-text text-[0.6rem] h-full border-1 ml-[2px] !bg-white !font-normal text-black p-1 absolute top-0 left-[100%] text-nowrap flex items-center'>{field.text}</span>
}

interface Props {
    data: Query;
    resetHighlight: () => void;
}

export default function QueryNode({ data, resetHighlight }: Props) {
    const { name, selectClause, type } = data;
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
                const isFieldEdge = e.id.includes(field.id) || (field.references?.some((ref: any) => ref.parentId && e.id.endsWith(ref.parentId)));

                if (!isFieldEdge) {
                    return {
                        ...e,
                        animated: false,
                        className: ''
                    };
                }

                return {
                    ...e,
                    animated: true,
                    className: field.isAmbiguous ? EDGE_AMBIGUOUS_CLASS : EDGE_HIGHLIGHT_CLASS,
                };
            });

            return updated;
        });
    }

    return (
        <div className="rounded-t-xs overflow-visible border-1 bg-gray-900">
            <header className='py-1 px-2 bg-gray-900 flex items-center justify-between'>
                <span className='text-lg text-white'>{name}</span>
                <TypeLabel type={type}></TypeLabel>
            </header>
            <section className='text-sm bg-white'>
                {selectClause.fields.map((field, index) => (
                    <div data-fieldid={field.id} key={index} tabIndex={index} className="text-xs p-1 border-b border-gray-300 cursor-pointer hover:bg-gray-100 flex justify-between items-center relative overflow-visible"
                        onClick={(event) => onFieldClick(event, field, index)}>
                        {field.alias}

                        {field.references && field.references.length > 0 && (
                            <Handle type="target" position={Position.Left} id={`${field.id}-target`} />
                        )}

                        {field.isSource && (
                            <Handle type="source" position={Position.Right} id={`${field.id}-source`} />
                        )}

                        <InvocationFieldLabel field={field}></InvocationFieldLabel>
                        <InvocationFieldText field={field}></InvocationFieldText>
                    </div>
                ))}
            </section>
        </div>
    );
}