import { Handle, Position, useReactFlow } from '@xyflow/react';
import React from 'react';
import { Query } from '../../../interfaces/query';
import { Field, FieldReference, FieldType } from '../../../interfaces/field';
import { EDGE_HIGHLIGHT_CLASS, FIELD_HIGHLIGHT_CLASS } from '../QueryDisplay';
import { AbcOutlined, Calculate, CalculateOutlined, SwapVerticalCircleRounded, SwapVertOutlined } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

function TypeLabel({ type }: { type: string }) {
    if (type === 'statement') return;

    return (
        <span className='text-[0.6rem] p-1 bg-gray-200 rounded-2xl ml-6'>{type}</span>
    );
}

interface Props {
    data: Query;
    resetHighlight: () => void;
}

export default function QueryNode({ data, resetHighlight }: Props) {
    const { id, name, selectClause, type, unionClause } = data;
    const { setEdges } = useReactFlow();

    const onFieldClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, field: Field, index: number) => {
        event.stopPropagation();
        resetHighlight();
        highlightField(field);
        highlightEdges(field);
    }

    const highlightField = (field: Field) => {
        const highlightIds = [field.id, ...field.references.map(r => r.fieldId)];

        highlightIds.forEach(fieldId => {
            document.querySelectorAll(`[data-fieldid="${fieldId}"]`).forEach((field) => {
                field.classList.add(FIELD_HIGHLIGHT_CLASS);
            });
        });
    };

    const fieldIcon = (field: Field) => {
        switch(field.type) {
            case FieldType.INVOCATION:
                return <CalculateOutlined className='!text-[0.65rem]'></CalculateOutlined>
            case FieldType.CAST:
                return <SwapVertOutlined className='!text-[0.65rem]'></SwapVertOutlined>
            case FieldType.LITERAL:
                return <AbcOutlined className='!text-[0.65rem]'></AbcOutlined>
        }
    }

    const highlightEdges = (field: Field) => {
        setEdges((prevEdges) => {
            const updated = prevEdges.map((e) => {
                const isFieldEdge = e.id.includes(field.id) || field.references.some((ref: FieldReference) => e.id.includes(ref.fieldId));

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
                    className: EDGE_HIGHLIGHT_CLASS,
                };
            });

            return updated;
        });
    }

    return (
        <div className="rounded-t-xs overflow-visible border-1 bg-gray-900">
            {/* UNION target handle */}
            {unionClause && (
                <Handle type="target" position={Position.Top} id="union-target" />
            )}
            
            <header className='py-1 px-2 bg-gray-900 flex items-center justify-between'>
                <span className='text-lg text-white'>{name}</span>
                <TypeLabel type={type}></TypeLabel>
            </header>
            <section className='text-sm bg-white'>
                {selectClause.fields.map((field, index) => (
                    <div data-fieldid={field.id} key={index} tabIndex={index} 
                        className="text-xs p-1 border-b border-gray-300 cursor-pointer hover:bg-gray-100 flex justify-between items-center relative overflow-visible"
                        onClick={(event) => onFieldClick(event, field, index)}>
                        
                        <Tooltip title={field.type.toUpperCase()} className='mr-2'>
                            <span>{fieldIcon(field)}</span>
                        </Tooltip>
                        

                        {field.alias}

                        { field.references.length > 0 &&
                            <Handle type="target" position={Position.Left} id={`${field.id}-target`} />
                        }

                        { field.isReferenced &&
                            <Handle type="source" position={Position.Right} id={`${field.id}-source`} />
                        }
                    </div>
                ))}
                
                {/* UNION clause indicator */}
                {unionClause && (
                    <div className="text-xs p-1 border-b border-gray-300 bg-blue-50 flex justify-between items-center relative overflow-visible">
                        <span className="text-blue-600 font-medium">{unionClause.type}</span>
                        <Handle type="source" position={Position.Right} id="union-source" />
                    </div>
                )}
            </section>
        </div>
    );
}