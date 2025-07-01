import { Handle, Position, useReactFlow } from '@xyflow/react';
import React from 'react';
import { Query } from '../../../interfaces/query';
import { Field, FieldOrigin, FieldReference, FieldType } from '../../../interfaces/field';
import { EDGE_HIGHLIGHT_CLASS, FIELD_HIGHLIGHT_CLASS } from '../QueryDisplay';
import { Abc, AbcOutlined, Calculate, CalculateOutlined, SwapVert, SwapVerticalCircleRounded, SwapVertOutlined, TableChart, TableChartOutlined, ViewColumn, ViewColumnOutlined } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { ARROW_MARKER, ARROW_MARKER_HIGHLIGHT } from '../../../hooks/useQueryFlow';

interface Props {
    data: Query;
    resetHighlight: () => void;
}

export default function QueryNode({ data, resetHighlight }: Props) {
    const {  name, selectClause } = data;
    const { setEdges } = useReactFlow();

    const onFieldClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, field: Field, index: number) => {
        event.stopPropagation();
        resetHighlight();
        highlightField(field);
        highlightEdges(field);
    }

    const getHighlightIds = (field: Field): string[] => {
        const relatedIds: string[] = [field.id];
        const refs: FieldReference[] = [...field.references];

        while(refs.length > 0) {
            const ref = refs.shift();

            if (!ref) { 
                break;
            }

            if (ref.origin === FieldOrigin.JOIN) {
                relatedIds.push(ref.nodeId);
            }

            refs.push(...ref.parents);
            relatedIds.push(ref.fieldId);
        }

        const referencedByIds = [...field.referencedBy];

        while (referencedByIds.length > 0) {
            const f = referencedByIds.shift();
            if (!f) {
                break;
            }

            relatedIds.push(f.id);
            referencedByIds.push(...f.referencedBy);
        }

        return relatedIds;
    }

    const highlightField = (field: Field) => {
        const highlightIds = getHighlightIds(field);

        highlightIds.forEach(fieldId => {
            document.querySelectorAll(`[data-fieldid="${fieldId}"]`).forEach((field) => {
                field.classList.add(FIELD_HIGHLIGHT_CLASS);
            });
        });
    };

    const fieldIcon = (field: Field) => {
        switch(field.type) {
            case FieldType.INVOCATION:
                return <Calculate className='!text-[0.65rem]'></Calculate>
            case FieldType.CAST:
                return <SwapVert className='!text-[0.65rem]'></SwapVert>
            case FieldType.LITERAL:
                return <Abc className='!text-[0.65rem]'></Abc>
            default:
                return <ViewColumn className='!text-[0.65rem]'></ViewColumn>
        }
    }

    const highlightEdges = (field: Field) => {
        const highlightIds = getHighlightIds(field); 

        setEdges((prevEdges) => {
            const updated = prevEdges.map((e) => {
                const isFieldEdge = highlightIds.some(id => e.id.includes(id));

                if (!isFieldEdge) {
                    return {
                        ...e,
                        animated: false,
                        className: '',
                        markerEnd: ARROW_MARKER
                    };
                }

                return {
                    ...e,
                    animated: false,
                    className: EDGE_HIGHLIGHT_CLASS,
                    markerEnd: ARROW_MARKER_HIGHLIGHT,
                };
            });

            return updated;
        });
    }

    return (
        <div className="rounded-sm border-1 border-gray-200 min-w-[100px] bg-white shadow-xs">
            <header className='py-1 px-4 text-primary text-center border-b-1 border-gray-200 font-bold'>
                <TableChart className='text-primary !text-[0.65rem] mr-2'></TableChart>
                <span className='text-sm'>{name}</span>
            </header>
            <section className='text-sm bg-white'>
                {selectClause.fields.map((field, index) => (
                    <div data-fieldid={field.id} key={index} tabIndex={index} 
                        className="text-xs py-[0.25rem] px-2 cursor-pointer hover:bg-gray-100 flex items-center relative"
                        onClick={(event) => onFieldClick(event, field, index)}>
                        
                        <Tooltip title={field.type.toUpperCase()} className='mr-2'>
                            <span className='text-primary'>{fieldIcon(field)}</span>
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
            </section>
        </div>
    );
}