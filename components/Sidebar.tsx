import React from 'react';
import { Zap, Bot } from 'lucide-react';

export default function Sidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/reactflow-data', JSON.stringify(nodeData));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 h-full bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Components
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Drag and drop to add to workflow
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Webhook Node */}
                <div
                    className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg cursor-grab hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors shadow-sm"
                    onDragStart={(event) => onDragStart(event, 'process', { label: 'Webhook' })}
                    draggable
                >
                    <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500">
                        <Zap size={18} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Webhook
                    </span>
                </div>

                {/* AI Agent Node */}
                <div
                    className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg cursor-grab hover:border-pink-500 dark:hover:border-pink-500 transition-colors shadow-sm"
                    onDragStart={(event) => onDragStart(event, 'process', { label: 'AI Agent' })}
                    draggable
                >
                    <div className="p-2 rounded bg-pink-50 dark:bg-pink-900/30 text-pink-500">
                        <Bot size={18} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        AI Agent
                    </span>
                </div>
            </div>
        </aside>
    );
}
