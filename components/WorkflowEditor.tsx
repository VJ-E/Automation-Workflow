"use client";

import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ProcessNode } from './nodes/ProcessNode';
import { DiscordNode } from './nodes/DiscordNode';
import { GoogleSheetsNode } from './nodes/GoogleSheetsNode';
import { EmailNode } from './nodes/EmailNode';
import { GmailTriggerNode } from './nodes/GmailTriggerNode';
import Sidebar from './Sidebar';
import NodeConfigPanel from './NodeConfigPanel';
import TopBar from './TopBar';
import ExecutionConsole from './ExecutionConsole';
import { useCallback, useRef, useState, useEffect } from 'react';

const nodeTypes = {
    process: ProcessNode,
    discord: DiscordNode,
    googleSheets: GoogleSheetsNode,
    email: EmailNode,
    gmailTrigger: GmailTriggerNode,
};

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'process',
        position: { x: 100, y: 100 },
        data: { label: 'Webhook Listener', status: 'Active' },
    },
    {
        id: '2',
        type: 'process',
        position: { x: 500, y: 100 },
        data: { label: 'AI Summarizer', status: 'Ready' },
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
];

function WorkflowEditorContent() {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { screenToFlowPosition } = useReactFlow();
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    // Execution Console State
    const [executionResult, setExecutionResult] = useState<{ logs: string[], finalData: any } | null>(null);
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const dataString = event.dataTransfer.getData('application/reactflow-data');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const data = dataString ? JSON.parse(dataString) : { label: 'New Node' };

            const newNode: Node = {
                id: `${Date.now()}`,
                type,
                position,
                data: { ...data, status: 'Ready' },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes],
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

    const handleRun = useCallback(async () => {
        setIsRunning(true);
        setExecutionResult(null); // Clear previous results
        try {
            const response = await fetch('/api/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nodes, edges }),
            });

            if (!response.ok) {
                throw new Error('Failed to start workflow');
            }

            const result = await response.json();

            // Update Console State
            setExecutionResult({
                logs: result.logs || [],
                finalData: result.finalData || {}
            });
            setIsConsoleOpen(true);

        } catch (error) {
            console.error('Error running workflow:', error);
            alert('Failed to start workflow');
        } finally {
            setIsRunning(false);
        }
    }, [nodes, edges]);

    const handleSave = useCallback(() => {
        if (nodes.length === 0) {
            alert("Nothing to save!");
            return;
        }
        const flowData = { nodes, edges };
        localStorage.setItem('flowlite-workflow', JSON.stringify(flowData));
        alert("Workflow saved locally!");
    }, [nodes, edges]);

    useEffect(() => {
        const savedFlow = localStorage.getItem('flowlite-workflow');
        if (savedFlow) {
            try {
                const parsed = JSON.parse(savedFlow);
                if (parsed.nodes && parsed.edges) {
                    setNodes(parsed.nodes);
                    setEdges(parsed.edges);
                }
            } catch (error) {
                console.error("Failed to parse saved workflow:", error);
            }
        }
    }, [setNodes, setEdges]); // Ensure dependencies are correct

    const handleClear = useCallback(() => {
        if (confirm("Are you sure you want to clear the canvas?")) {
            setNodes([]);
            setEdges([]);
        }
    }, [setNodes, setEdges]);

    const handleDelete = useCallback(() => {
        // Delete selected nodes
        const selectedNodes = nodes.filter(n => n.selected);
        const selectedEdges = edges.filter(e => e.selected);

        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
            setNodes(nds => nds.filter(n => !n.selected));
            setEdges(eds => eds.filter(e => !e.selected));
            setSelectedNodeId(null); // Clear selection state
        }
    }, [nodes, edges, setNodes, setEdges]);

    return (
        <div className="w-full h-screen flex flex-col bg-zinc-900 text-white relative">
            <TopBar
                onRun={handleRun}
                onSave={handleSave}
                onDelete={handleDelete}
                onClear={handleClear}
                isRunning={isRunning}
            />
            <div className="flex-1 flex overflow-hidden pt-14 pb-12">
                <Sidebar />
                <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background gap={12} size={1} />
                        <Controls />
                    </ReactFlow>
                    <NodeConfigPanel selectedNodeId={selectedNodeId} setNodes={setNodes} />
                </div>
            </div>

            {/* Execution Console */}
            {executionResult && (
                <ExecutionConsole
                    logs={executionResult.logs}
                    finalData={executionResult.finalData}
                    isOpen={isConsoleOpen}
                    onToggle={() => setIsConsoleOpen(!isConsoleOpen)}
                    onClose={() => setExecutionResult(null)}
                />
            )}
        </div>
    );
}

export default function WorkflowEditor() {
    return (
        <ReactFlowProvider>
            <WorkflowEditorContent />
        </ReactFlowProvider>
    );
}
