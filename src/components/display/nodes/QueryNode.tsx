import { Handle, Position, useReactFlow } from '@xyflow/react';
import React from 'react';
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
    const { setEdges, getNodes } = useReactFlow();

    const onFieldClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, field: Field, index: number) => {
        event.stopPropagation();
        resetHighlight();

        if (type === 'statement') {
            const nodes = getNodes();
            const cteNode = nodes.find(n => {
                const nodeData = n.data;
                return 'type' in nodeData && nodeData.type === 'cte';
            });

            if (cteNode) {
                const cteQuery = cteNode.data;
                if ('fields' in cteQuery && Array.isArray(cteQuery.fields)) {
                    let cteFieldIndex = -1;

                    if (field.text === 'a') {
                        cteFieldIndex = cteQuery.fields.findIndex((f: { name: string }) => f.name === 'a');
                        if (cteFieldIndex !== -1 && 'id' in cteQuery.fields[cteFieldIndex]) {
                            highlightField(cteQuery.fields[cteFieldIndex].id);
                        }
                    } else if (field.text === 'c.b') {
                        cteFieldIndex = cteQuery.fields.findIndex((f: { name: string }) => f.name === 'b');
                        if (cteFieldIndex !== -1 && 'id' in cteQuery.fields[cteFieldIndex]) {
                            highlightField(cteQuery.fields[cteFieldIndex].id);
                        }
                    }
                }
            }
        }

        highlightField(field.id);
        highlightEdges(field, type);
    }

    const highlightField = (fieldId: string) => {
        document.querySelectorAll(`[data-fieldid="${fieldId}"]`).forEach((field) => {
            field.classList.add(FIELD_HIGHLIGHT_CLASS);
        });
    };

    const highlightEdges = (field: Field, nodeType: string) => {
        setEdges((prevEdges) => {
            const updated = prevEdges.map((e) => {                
                const isDirectEdge = e.sourceHandle?.startsWith(`field-`) || e.targetHandle?.startsWith(`field-`);
                const isConnectedToField = e.id.includes(field.id);

                const isStructuralEdge = !e.sourceHandle && !e.targetHandle;

                if (nodeType === 'statement') {
                    if (field.text === 'a') {                        
                        if (isDirectEdge && isConnectedToField) {
                            return {
                                ...e,
                                animated: true,
                                className: EDGE_HIGHLIGHT_CLASS,
                                style: {
                                    ...e.style,
                                    stroke: '#2196f3',
                                    strokeWidth: 2,
                                }
                            };
                        }
                    } else if (field.text === 'c.b') {                        
                        if ((isDirectEdge && isConnectedToField) || 
                            (isStructuralEdge && e.target.includes('c'))) {
                            return {
                                ...e,
                                animated: true,
                                className: EDGE_HIGHLIGHT_CLASS,
                                style: {
                                    ...e.style,
                                    stroke: '#2196f3',
                                    strokeWidth: 2,
                                }
                            };
                        }
                    }
                } else if (nodeType === 'cte') {                    
                    if (field.name === 'b' && isStructuralEdge && e.target.includes('c')) {
                        return {
                            ...e,
                            animated: true,
                            className: EDGE_HIGHLIGHT_CLASS,
                            style: {
                                ...e.style,
                                stroke: '#2196f3',
                                strokeWidth: 2,
                            }
                        };
                    }
                }

                return {
                    ...e,
                    animated: false,
                    className: '',
                    style: e.style
                };
            });

            return updated;
        });
    }

    return (
        <div className="rounded-t-xs overflow-hidden border-1 bg-gray-900">
            <header className='py-1 px-2 bg-gray-900 flex items-center justify-between'>
                <span className='text-xl text-white'>{name}</span>
                <TypeLabel type={type}></TypeLabel>
            </header>
            <section className='text-sm bg-white'>
                {fields.map((field, index) => (
                    <div key={index} className="relative">
                        <Handle
                            type="target"
                            position={Position.Left}
                            id={`field-${index}`}
                            style={{ top: '50%', background: '#2196f3', width: 8, height: 8 }}
                        />
                        <div
                            data-fieldid={field.id}
                            tabIndex={index}
                            className="text-xs p-1 border-b border-gray-300 cursor-pointer hover:bg-gray-100"
                            onClick={(event) => onFieldClick(event, field, index)}
                        >
                            {field.alias}
                        </div>
                        {type === 'cte' && (
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`field-${index}`}
                                style={{ top: '50%', background: '#2196f3', width: 8, height: 8 }}
                            />
                        )}
                    </div>
                ))}
            </section>
        </div>
    );
}