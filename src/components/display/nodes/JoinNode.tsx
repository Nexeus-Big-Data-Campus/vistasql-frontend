import { Handle, Position } from "@xyflow/react";
import { Join } from "../../../interfaces/join";
import { Tooltip } from "@mui/material";

interface Props {
    data: Join;
}

export default function JoinNode({ data }: Props) {

    const getJoinIcon = () => {
        switch (data.type.toLowerCase()) {
            case 'inner':
                return '/icons/inner_join.png';
            case 'left':
                return '/icons/left_join.png';
            case 'right':
                return '/icons/right_join.png';
            default:
                return '/icons/inner_join.png';
        }
    }

    const getJoinText = () => {
        return data.type.toUpperCase() + ' JOIN';
    }

    return <>
        <div className="!rounded-[50%] !bg-white !border-1 !boder-black p-4 text-center aspect-square !text-sm max-w-[100px] uppercase flex flex-col items-center">
            <Tooltip title={getJoinText()} placement="top">
                <img src={getJoinIcon()} alt="join" className="w-6 h-6"/>
            </Tooltip>
        </div>
        <Handle type="target" position={Position.Left} id={'target'}/>
        <Handle type="source" position={Position.Right} id={'source'}/>
    </>
}