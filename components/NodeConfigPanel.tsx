import React, { useEffect, useState } from 'react';
import { useReactFlow, Node } from '@xyflow/react';
import { X } from 'lucide-react';

type NodeConfigPanelProps = {
    selectedNodeId: string | null;
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
};

export default function NodeConfigPanel({ selectedNodeId, setNodes }: NodeConfigPanelProps) {
    const { getNode } = useReactFlow();
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    // Sync internal state with selected node
    useEffect(() => {
        if (selectedNodeId) {
            const node = getNode(selectedNodeId);
            setSelectedNode(node || null);
        } else {
            setSelectedNode(null);
        }
    }, [selectedNodeId, getNode, setNodes]); // Added setNodes to dependecy to ensure we have fresh state if needed, though getNode is primary

    // We also need to listen to nodes changes if we want real-time update reflected back in the input (optional but good)
    // But for now, we drive the node state FROM the inputs.

    if (!selectedNodeId || !selectedNode) return null;

    const handleChange = (field: string, value: string) => {
        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === selectedNodeId) {
                    // Update internal state as well to reflect changes immediately in UI if we were using controlled inputs from node data directly
                    // But here we rely on the fact that setNodes triggers a re-render of this component? 
                    // Actually, WorkflowEditor re-renders, but does it pass new props? 
                    // We might need to update local state or just use the props.
                    // Let's rely on ReactFlow updates.
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            [field]: value,
                        },
                    };
                }
                return n;
            })
        );
        // Update local state to keep inputs in sync without waiting for parent re-render cycle issues if any
        setSelectedNode((prev) => prev ? ({ ...prev, data: { ...prev.data, [field]: value } }) : null);
    };

    const isAIAgent = selectedNode.data.label === 'AI Agent' || selectedNode.data.label === 'AI Summarizer';
    const isWebhook = selectedNode.data.label === 'Webhook' || selectedNode.data.label === 'Webhook Listener';
    const isDiscord = selectedNode.type === 'discord' || selectedNode.data.label === 'Discord Node';
    const isGoogleSheets = selectedNode.type === 'googleSheets' || selectedNode.data.label === 'Google Sheets' || selectedNode.data.label === 'Sheet Append';
    const isEmail = selectedNode.type === 'email' || selectedNode.data.label === 'Email Sender';

    return (
        <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 shadow-xl p-4 z-50">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-zinc-800 pb-4">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                    Configuration
                </h3>
                <button
                    onClick={() => {
                        // We rely on parent to close, but we don't have a close handler passed in props according to prompt.
                        // The prompt says "Add an onPaneClick handler that sets it to null". 
                        // We can just imply clicking outside closes it, but a close button is nice.
                        // For now, I'll just leave it or maybe add a visual close that doesn't work? 
                        // No, I'll stick to the prompt's instructions: onPaneClick closes it. 
                        // But for UX, users expect a close button. I will add one if I can modify the props, 
                        // but strictly following prompt: "The Panel Component... It should take selectedNodeId and setNodes as props."
                        // I won't add a close callback prop to keep it simple as per request.
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    {/* <X size={20} />  -- Removing since I can't close it from here without a prop */}
                    <span className="text-xs">Selected: {selectedNodeId}</span>
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Label
                    </label>
                    <input
                        type="text"
                        value={selectedNode.data.label as string || ''}
                        onChange={(e) => handleChange('label', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white"
                    />
                </div>

                {isAIAgent && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Model
                            </label>
                            <select
                                value={selectedNode.data.model as string || 'gpt-4'}
                                onChange={(e) => handleChange('model', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white"
                            >
                                <option value="gpt-4">GPT-4</option>
                                <option value="gemini-pro">Gemini Pro</option>
                                <option value="claude-3">Claude 3</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                System Prompt
                            </label>
                            <textarea
                                value={selectedNode.data.systemPrompt as string || ''}
                                onChange={(e) => handleChange('systemPrompt', e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white resize-none"
                                placeholder="You are a helpful assistant..."
                            />
                        </div>
                    </>
                )}

                {isWebhook && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Route Path
                        </label>
                        <input
                            type="text"
                            value={selectedNode.data.routePath as string || '/'}
                            onChange={(e) => handleChange('routePath', e.target.value)}
                            placeholder="/my-webhook"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white"
                        />
                    </div>
                )}

                {isDiscord && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Webhook URL
                            </label>
                            <input
                                type="text"
                                value={selectedNode.data.webhookUrl as string || ''}
                                onChange={(e) => handleChange('webhookUrl', e.target.value)}
                                placeholder="https://discord.com/api/webhooks/..."
                                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Message Content (Text or JSON)
                            </label>
                            <textarea
                                value={selectedNode.data.messageContent as string || ''}
                                onChange={(e) => handleChange('messageContent', e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white resize-none font-mono text-xs"
                                placeholder='Hello World OR {"embeds": [...]}'
                            />
                        </div>
                    </>
                )}

                {isGoogleSheets && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Spreadsheet ID
                            </label>
                            <input
                                type="text"
                                value={selectedNode.data.sheetId as string || ''}
                                onChange={(e) => handleChange('sheetId', e.target.value)}
                                placeholder="1BxiMVs0XRA5nFMdKbBdBKJ9..."
                                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Range
                            </label>
                            <input
                                type="text"
                                value={selectedNode.data.range as string || 'Sheet1!A:A'}
                                onChange={(e) => handleChange('range', e.target.value)}
                                placeholder="Sheet1!A:A"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Values (Comma Separated)
                            </label>
                            <textarea
                                value={selectedNode.data.values as string || ''}
                                onChange={(e) => handleChange('values', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white resize-none font-mono text-xs"
                                placeholder='Value1, Value2, Value3'
                            />
                        </div>
                    </>
                )}

                {isEmail && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                To (Email Address)
                            </label>
                            <input
                                type="text"
                                value={selectedNode.data.emailTo as string || ''}
                                onChange={(e) => handleChange('emailTo', e.target.value)}
                                placeholder="recipient@example.com"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Subject
                            </label>
                            <input
                                type="text"
                                value={selectedNode.data.emailSubject as string || ''}
                                onChange={(e) => handleChange('emailSubject', e.target.value)}
                                placeholder="Notification"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Body (HTML or Text)
                            </label>
                            <textarea
                                value={selectedNode.data.emailBody as string || ''}
                                onChange={(e) => handleChange('emailBody', e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white resize-none"
                                placeholder="Hello, this is an automated message."
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
