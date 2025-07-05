import { useReactFlow } from '@xyflow/react';
import React from 'react';
import { Query } from '../../../interfaces/query';
import { Field, FieldOrigin, FieldReference } from '../../../interfaces/field';
import { EDGE_HIGHLIGHT_CLASS, FIELD_HIGHLIGHT_CLASS } from '../QueryDisplay';
import { TableChart } from '@mui/icons-material';
import { ARROW_MARKER, ARROW_MARKER_HIGHLIGHT } from '../../../hooks/useQueryFlow';
import { QueryField } from './QueryField';

interface Props {
    data: Query;
    resetHighlight: () => void;
}

export default function QueryNode({ data, resetHighlight }: Props) {
    const {  name, selectClause, unionClauses } = data;
    const { setEdges } = useReactFlow();

    const onFieldClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, field: Field) => {
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
            document.querySelectorAll(`[data-fieldid="${fieldId}"], [data-relatedids*="${fieldId}"]`).forEach((field) => {
                field.classList.add(FIELD_HIGHLIGHT_CLASS);
            });
        });
    };

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
            <section className='text-sm bg-white text-xs'>
                {
                    selectClause.fields.map((field) => 
                        <QueryField field={field} key={field.id} onFieldClick={onFieldClick}></QueryField>   
                    )
                }

                {
                    unionClauses.map(union => 
                        <>
                            <div className='w-full p-2 text-primary'>
                                UNION
                            </div>

                            {
                                union.selectClause.fields.map((field) =>
                                    <QueryField field={field} key={'union' + field.id} onFieldClick={onFieldClick}></QueryField>
                                )
                            }
                        </>
                    )
                }
            </section>
        </div>
    );
}