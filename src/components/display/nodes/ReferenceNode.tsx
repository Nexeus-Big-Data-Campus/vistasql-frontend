import { Handle, Position } from "@xyflow/react";
import { ObjectReference } from "../../../interfaces/query";
import { TableChart } from "@mui/icons-material";


interface Props {
    data: ObjectReference;
}   

export default function ReferenceNode({ data }: Props) {

    return <>
        <header className='rounded-sm py-1 px-4 bg-white text-primary !font-bold border-1 border-gray-200 shadow-xs'>
            <TableChart className='!text-[0.65rem] mr-2'></TableChart>
            <span className='text-sm'>{data.name}</span>
        </header>
        <Handle type="source" position={Position.Right} id={`source`}/>
    </>
}