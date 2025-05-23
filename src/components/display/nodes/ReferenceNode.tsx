import { Handle, Position } from "@xyflow/react";
import { Reference } from "../../../interfaces/reference"


interface Props {
    data: Reference;
}   

export default function ReferenceNode({ data }: Props) {

    return <>
        <header className='py-1 px-2 bg-gray-900 flex items-center justify-between rounded-xs'>
            <span className='text-xl text-white'>{data.name}</span>
        </header>
        <Handle type="source" position={Position.Right} id={'source'}/>
    </>
}