import { Handle, Position } from "@xyflow/react";
import { Join } from "../../../interfaces/join";


interface Props {
    data: Join;
}

export default function JoinNode({ data }: Props) {

    return <>
        <div className="!rounded-[50%] !bg-white !border-1 !boder-black p-4 text-center aspect-square !text-sm max-w-[100px] uppercase flex items-center">
            {data.type} JOIN
        </div>
        <Handle type="target" position={Position.Left} id={'target'}/>
        <Handle type="source" position={Position.Right} id={'source'}/>
    </>
}