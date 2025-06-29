import { Handle, Position } from "@xyflow/react";
import { Join } from "../../../interfaces/join";
import { Tooltip } from "@mui/material";
import { JoinFull, JoinInner, JoinLeft, JoinRight } from "@mui/icons-material";

interface Props {
    data: Join;
}

export default function JoinNode({ data }: Props) {

    const joinIcon = () => {
        switch (data.type.toLowerCase()) {
            case 'inner':
                return <JoinInner className="!text-md !text-primary"></JoinInner>
            case 'left':
                return <JoinLeft className="!text-md !text-primary"></JoinLeft>;
            case 'right':
                return <JoinRight className="!text-md"></JoinRight>;
            default:
                return <JoinFull className="!text-md"></JoinFull>
        }
    }

    const getJoinText = () => {
        return data.type.toUpperCase() + ' JOIN';
    }

    return <>
        <div className="rounded-sm border-1 border-gray-200 bg-white py-1 px-4 text-center shadow-sm">
            <Tooltip title={getJoinText()} placement="top">
                <span id="join-icon">
                    {joinIcon()}
                </span>
            </Tooltip>
        </div>
        <Handle type="target" position={Position.Left} id={'target'}/>
        <Handle type="source" position={Position.Right} id={'source'}/>
    </>
}