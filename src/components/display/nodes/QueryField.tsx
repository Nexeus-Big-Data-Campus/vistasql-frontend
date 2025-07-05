import { Tooltip } from "@mui/material";
import { Field, FieldType } from "../../../interfaces/field";
import { Handle, Position } from "@xyflow/react";
import { Abc, Calculate, SwapVert, ViewColumn } from "@mui/icons-material";


interface Props {
    field: Field;
    onFieldClick: any
}

export const QueryField = ({ field, onFieldClick }: Props) => {

    const getRelatedIds = (field: Field): string => {
        const relatedFields = [...field.references.map(r => r.fieldId), ...field.referencedBy.map(f => f.id)];
        return relatedFields.join('');
    }   

    const fieldIcon = (field: Field) => {
        switch(field.type) {
            case FieldType.INVOCATION:
                return <Calculate className='!text-[0.65rem]'></Calculate>
            case FieldType.CAST:
                return <SwapVert className='!text-[0.65rem]'></SwapVert>
            case FieldType.LITERAL:
                return <Abc className='!text-[.9rem]'></Abc>
            default:
                return <ViewColumn className='!text-[0.65rem]'></ViewColumn>
        }
    }

    return <div data-fieldid={field.id} 
            data-relatedids={getRelatedIds(field)}
            className="text-xs py-[0.25rem] px-2 cursor-pointer hover:bg-gray-100 flex items-center relative"
            onClick={(event) => onFieldClick(event, field)}>
        
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
}