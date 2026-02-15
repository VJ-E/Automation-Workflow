import React from 'react';
import { Play } from 'lucide-react';

type TopBarProps = {
    onRun: () => void;
    onSave: () => void;
    isRunning: boolean;
};

export default function TopBar({ onRun, onSave, isRunning }: TopBarProps) {
    return (
        <div className="h-14 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-10 w-full">
            <div className="font-bold text-xl bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Automation WorkFlow
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onSave}
                    disabled={isRunning}
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                    Save
                </button>
                <button
                    onClick={onRun}
                    disabled={isRunning}
                    className={`
            flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all shadow-md
            ${isRunning
                            ? 'bg-slate-300 dark:bg-zinc-700 text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                        }
        `}
                >
                    <Play size={18} fill={isRunning ? "none" : "currentColor"} className={isRunning ? "animate-spin" : ""} />
                    {isRunning ? "Running..." : "Run"}
                </button>
            </div>
        </div>
    );
}
