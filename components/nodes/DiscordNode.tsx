import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

// Define the data structure for our custom node
export type DiscordNodeData = {
    label: string;
    status?: string;
    webhookUrl?: string; // Optional for now, stored in data
    messageContent?: string;
};

// Define the props type including our data
export type DiscordNodeProps = NodeProps<Node<DiscordNodeData>>;

export function DiscordNode({ data }: DiscordNodeProps) {
    return (
        <div className="w-64 bg-white dark:bg-[#5865F2] border-2 border-slate-200 dark:border-[#4752C4] rounded-xl shadow-lg transition-all hover:shadow-xl hover:border-slate-300 dark:hover:border-[#4752C4]">
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-slate-400 !w-3 !h-3"
            />

            {/* Header */}
            <div className="flex items-center gap-3 p-3 border-b border-slate-100 dark:border-[#4752C4]">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-white/20 text-indigo-500 dark:text-white">
                    <MessageSquare size={18} />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {data.label}
                    </h3>
                </div>
            </div>

            {/* Body */}
            <div className="p-3">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-500 dark:text-white/80 uppercase tracking-wide">
                        {data.status || "Ready"}
                    </span>
                </div>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Right}
                className="!bg-indigo-500 !w-3 !h-3"
            />
        </div>
    );
}
