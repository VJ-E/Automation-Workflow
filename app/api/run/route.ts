import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API Client
// Ensure you have GEMINI_API_KEY in your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

type Node = {
    id: string;
    data: {
        label: string;
        [key: string]: any;
    };
};

type Edge = {
    source: string;
    target: string;
};

export async function POST(req: Request) {
    try {
        const { nodes, edges } = await req.json();

        // 1. Build Adjacency List (Map<sourceId, targetId>)
        // Assuming simple linear flow for now (one output per node)
        const adjacencyList = new Map<string, string>();
        (edges as Edge[]).forEach((edge) => {
            adjacencyList.set(edge.source, edge.target);
        });

        // 2. Find Start Node
        // For this demo, we look for "Webhook Listener" or a node with no incoming edges if we wanted to be generic. 
        // But specific request says: "Find the one labeled 'Webhook Listener'"
        const startNode = (nodes as Node[]).find(
            (n) => n.data.label === 'Webhook' || n.data.label === 'Webhook Listener'
        );

        if (!startNode) {
            return NextResponse.json({ error: 'No Webhook Listener node found' }, { status: 400 });
        }

        // 3. Execution Loop
        let currentNodeId: string | undefined = startNode.id;
        let contextData: Record<string, any> = {};
        const logs: string[] = [];

        console.log("---------------- FLOW START ----------------");

        while (currentNodeId) {
            const currentNode = (nodes as Node[]).find((n) => n.id === currentNodeId);
            if (!currentNode) break;

            console.log(`Executing Node: ${currentNode.data.label} (${currentNode.id})`);

            switch (currentNode.data.label) {
                case 'Webhook':
                case 'Webhook Listener':
                    contextData = { body: "This is a sample email from a client complaining about a bug." };
                    logs.push("Executed Webhook Listener");
                    logs.push(`Received payload: "${contextData.body}"`);
                    break;

                case 'AI Agent':
                case 'AI Summarizer':
                    try {
                        logs.push(`Processing with AI Model: gemini-1.5-flash`);

                        if (!process.env.GEMINI_API_KEY) {
                            throw new Error("Missing GEMINI_API_KEY environment variable");
                        }

                        const systemPrompt = currentNode.data.systemPrompt || 'Summarize this text.';
                        const emailBody = contextData.body || 'No input data provided.';

                        const finalPrompt = `${systemPrompt}\n\nInput Data:\n${emailBody}`;

                        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
                        const result = await model.generateContent(finalPrompt);
                        const response = result.response.text();

                        contextData.summary = response;
                        logs.push("Executed AI Agent");
                        console.log("AI Response:", response);
                        // Limit log output
                        logs.push(`AI Response: "${response.substring(0, 100)}..."`);

                    } catch (error: any) {
                        console.error("AI Execution Error:", error);
                        logs.push(`AI Execution Failed: ${error.message}`);
                        contextData.error = error.message;
                    }
                    break;

                case 'discord':
                case 'Discord Node':
                    try {
                        logs.push(`Executing Discord Node`);
                        const webhookUrl = currentNode.data.webhookUrl;
                        let messageContent = currentNode.data.messageContent || contextData.summary || "No content provided";

                        if (!webhookUrl) {
                            throw new Error("Discord Webhook URL is missing");
                        }

                        let payload: any = { content: messageContent };

                        // Check if messageContent is a JSON string for embeds
                        try {
                            if (typeof messageContent === 'string' && messageContent.trim().startsWith('{')) {
                                const parsed = JSON.parse(messageContent);
                                if (parsed.embeds || parsed.content) {
                                    payload = parsed;
                                }
                            }
                        } catch (e) {
                            // Not JSON, use as plain text
                        }

                        logs.push(`Sending to Discord Webhook...`);

                        const response = await fetch(webhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        if (!response.ok) {
                            throw new Error(`Discord API responded with ${response.status}: ${response.statusText}`);
                        }

                        logs.push("Discord Message Sent Successfully");
                    } catch (error: any) {
                        console.error("Discord Execution Error:", error);
                        logs.push(`Discord Execution Failed: ${error.message}`);
                        contextData.error = error.message;
                    }
                    break;

                default:
                    logs.push(`Executed ${currentNode.data.label} (No logic defined)`);
            }

            // Move to next node
            currentNodeId = adjacencyList.get(currentNodeId);

            // Safety break for infinite loops in this simple implementation
            if (logs.length > 50) {
                logs.push("Execution halted: limit reached");
                break;
            }

            // Simulate processing time per node
            await new Promise((resolve) => setTimeout(resolve, 500));
        }

        console.log("Final Context:", JSON.stringify(contextData, null, 2));
        console.log("---------------- FLOW END ------------------");

        return NextResponse.json({
            success: true,
            message: 'Workflow execution complete',
            logs,
            finalData: contextData,
            executionId: Date.now().toString()
        });
    } catch (error) {
        console.error("Error running workflow:", error);
        return NextResponse.json({ error: 'Failed to run workflow' }, { status: 500 });
    }
}
