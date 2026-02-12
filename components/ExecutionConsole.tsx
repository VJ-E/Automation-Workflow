import React, { useState } from 'react';
import { ChevronUp, ChevronDown, X, Terminal, FileJson } from 'lucide-react';

type ExecutionConsoleProps = {
    logs: string[];
    finalData: Record<string, any> | null;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
};

export default function ExecutionConsole({
    logs,
    finalData,
    isOpen,
    onToggle,
    onClose
}: ExecutionConsoleProps) {
    const [activeTab, setActiveTab] = useState<'logs' | 'json'>('logs');

    if (!logs.length && !finalData) return null;

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 transition-all duration-300 flex flex-col z-50 shadow-2xl ${isOpen ? 'h-80' : 'h-12'
                }`}
        >
            {/* Header / Toolbar */}
            <div
                className="h-12 flex items-center justify-between px-4 bg-slate-900 cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-green-400 font-mono text-sm font-bold">
                        <Terminal size={16} />
                        Execution Console
                    </div>

                    {isOpen && (
                        <div className="flex bg-slate-800 rounded-lg p-1" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setActiveTab('logs')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'logs'
                                        ? 'bg-slate-700 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                Logs
                            </button>
                            <button
                                onClick={() => setActiveTab('json')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'json'
                                        ? 'bg-slate-700 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                JSON Data
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronUp size={18} className="text-slate-400" />}
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-colors text-slate-400"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {isOpen && (
                <div className="flex-1 overflow-hidden flex bg-slate-950 font-mono text-sm">
                    {activeTab === 'logs' ? (
                        <div className="flex-1 overflow-auto p-4 space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="text-slate-300 border-l-2 border-slate-800 pl-3 py-1 hover:bg-slate-900/50">
                                    <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                    <span className={log.includes('Error') ? 'text-red-400' : 'text-green-400'}>&gt;</span> {log}
                                </div>
                            ))}
                            <div className="h-4" /> {/* Spacer */}
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto p-4 bg-slate-900/50">
                            <pre className="text-blue-300 language-json">
                                {JSON.stringify(finalData, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
