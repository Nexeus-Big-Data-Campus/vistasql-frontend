import { Handle, Position } from "@xyflow/react";
import { Reference } from "../../../interfaces/reference"


interface Props {
    data: Reference;
}   

export default function ReferenceNode({ data }: Props) {

    return <>
        <header className='py-2 px-4 bg-black flex items-center justify-between rounded'>
            <span className='text-xl text-white'>{data.name}</span>
        </header>
        <Handle type="source" position={Position.Right} id={'source'}/>
    </>
}