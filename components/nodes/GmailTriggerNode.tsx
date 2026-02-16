import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Mail } from 'lucide-react';

// Define the data structure for our custom node
export type GmailTriggerNodeData = {
    label: string;
    status?: string;
};

// Define the props type including our data
export type GmailTriggerNodeProps = NodeProps<Node<GmailTriggerNodeData>>;

export function GmailTriggerNode({ data }: GmailTriggerNodeProps) {
    return (
        <div className="w-64 bg-white dark:bg-zinc-900 border-2 border-red-500 rounded-xl shadow-[0_0_15px_-3px_rgba(239,68,68,0.5)] transition-all hover:shadow-[0_0_20px_-3px_rgba(239,68,68,0.7)]">
            {/* Header */}
            <div className="flex items-center gap-3 p-3 border-b border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-t-lg">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                    <Mail size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-red-700 dark:text-red-400 text-sm">
                        Gmail Trigger
                    </h3>
                </div>
            </div>

            {/* Body */}
            <div className="p-3">
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Action: Fetch Latest Unread Email
                </p>
                <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                        {data.status || "Standing By"}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 bg-slate-50 dark:bg-zinc-950/50 rounded-b-lg border-t border-slate-100 dark:border-zinc-800">
                <p className="text-[10px] text-slate-500 text-center">
                    Uses App Password (IMAP)
                </p>
            </div>

            {/* Output Handle (Source Only) */}
            <Handle
                type="source"
                position={Position.Right}
                className="!bg-red-500 !w-3 !h-3 !border-2 !border-white dark:!border-zinc-900"
            />
        </div>
    );
}
