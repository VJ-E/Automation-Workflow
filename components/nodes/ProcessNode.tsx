import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Settings } from 'lucide-react';

// Define the data structure for our custom node
export type ProcessNodeData = {
    label: string;
    status?: string;
};

// Define the props type including our data
export type ProcessNodeProps = NodeProps<Node<ProcessNodeData>>;

export function ProcessNode({ data }: ProcessNodeProps) {
    return (
        <div className="w-64 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-lg transition-all hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600">
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-slate-400 !w-3 !h-3"
            />

            {/* Header */}
            <div className="flex items-center gap-3 p-3 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500">
                    <Settings size={18} />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {data.label}
                    </h3>
                </div>
            </div>

            {/* Body */}
            <div className="p-3">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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
