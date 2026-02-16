import React from 'react';
import { Zap, Bot, MessageSquare, FileSpreadsheet, Mail } from 'lucide-react';

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

                {/* Discord Node */}
                <div
                    className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg cursor-grab hover:border-[#5865F2] dark:hover:border-[#5865F2] transition-colors shadow-sm"
                    onDragStart={(event) => onDragStart(event, 'discord', { label: 'Discord Node' })}
                    draggable
                >
                    <div className="p-2 rounded bg-[#5865F2]/10 dark:bg-[#5865F2]/20 text-[#5865F2]">
                        <MessageSquare size={18} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Discord Node
                    </span>
                </div>

                {/* Google Sheets Node */}
                <div
                    className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg cursor-grab hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors shadow-sm"
                    onDragStart={(event) => onDragStart(event, 'googleSheets', { label: 'Sheet Append' })}
                    draggable
                >
                    <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500">
                        <FileSpreadsheet size={18} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Sheet Append
                    </span>
                </div>

                {/* Email Node */}
                <div
                    className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg cursor-grab hover:border-amber-500 dark:hover:border-amber-500 transition-colors shadow-sm"
                    onDragStart={(event) => onDragStart(event, 'email', { label: 'Email Sender' })}
                    draggable
                >
                    <div className="p-2 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-500">
                        <Mail size={18} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Email Sender
                    </span>
                </div>

                {/* Gmail Trigger Node */}
                <div
                    className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/30 rounded-lg cursor-grab hover:border-red-500 dark:hover:border-red-500 transition-colors shadow-sm"
                    onDragStart={(event) => onDragStart(event, 'gmailTrigger', { label: 'Gmail Trigger' })}
                    draggable
                >
                    <div className="p-2 rounded bg-red-50 dark:bg-red-900/30 text-red-500">
                        <Mail size={18} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Gmail Trigger
                    </span>
                </div>
            </div>
        </aside>
    );
}
