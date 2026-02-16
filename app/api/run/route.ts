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

        // 1. Build Adjacency List (Map<sourceId, targetId[]>) - Support Branching
        const adjacencyList = new Map<string, string[]>();
        (edges as Edge[]).forEach((edge) => {
            if (!adjacencyList.has(edge.source)) {
                adjacencyList.set(edge.source, []);
            }
            adjacencyList.get(edge.source)?.push(edge.target);
        });

        // 2. Find Start Node - Support Multiple Trigger Types
        const startNode = (nodes as Node[]).find(
            (n) =>
                n.data.label === 'Webhook' ||
                n.data.label === 'Webhook Listener' ||
                n.data.label === 'Gmail Trigger' ||
                n.data.label === 'gmailTrigger'
        );

        if (!startNode) {
            return NextResponse.json({ error: 'No valid Trigger Node found (Webhook or Gmail Trigger)' }, { status: 400 });
        }

        // 3. Execution Loop (BFS/Queue)
        const executionQueue: string[] = [startNode.id];
        // We use a Set to track visited nodes for this simple DAG implementation to avoid infinite loops if cycles exist
        // However, for a true workflow, we might want to allow re-entry. For now, let's keep it simple.
        // Actually, for branching, we just process. If disjoint branches merge, we might double process. 
        // A robust engine would track "ready" state. But for this "FlowLite" MVP, a simple Queue is sufficient.

        let contextData: Record<string, any> = {};
        const logs: string[] = [];

        console.log("---------------- FLOW START ----------------");

        // Safety counter
        let executionCount = 0;

        while (executionQueue.length > 0) {
            const currentNodeId = executionQueue.shift();
            if (!currentNodeId) break;

            executionCount++;
            if (executionCount > 50) {
                logs.push("Execution halted: limit reached (50 steps)");
                break;
            }

            const currentNode = (nodes as Node[]).find((n) => n.id === currentNodeId);
            if (!currentNode) continue;

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

                        // Concatenate previous node data
                        let inputData = "";
                        if (contextData.from) inputData += `From: ${contextData.from}\n`;
                        if (contextData.subject) inputData += `Subject: ${contextData.subject}\n`;
                        if (contextData.body) inputData += `Body:\n${contextData.body}\n`;

                        if (!inputData) inputData = "No input data provided from previous nodes.";

                        const finalPrompt = `${systemPrompt}\n\n--- Start of Input Data ---\n${inputData}\n--- End of Input Data ---`;

                        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
                        const result = await model.generateContent(finalPrompt);
                        const response = result.response.text();

                        contextData.summary = response;
                        logs.push("Executed AI Agent");
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

                case 'googleSheets':
                case 'Sheet Append':
                case 'Google Sheets':
                    try {
                        logs.push(`Executing Google Sheets Node`);
                        const sheetId = currentNode.data.sheetId;
                        const range = currentNode.data.range || 'Sheet1!A:A';
                        // Fallback to summary if values input is empty
                        const valuesInput = currentNode.data.values || contextData.summary || "";

                        if (!sheetId) {
                            throw new Error("Spreadsheet ID is missing");
                        }

                        // Parse values
                        let values = [];
                        if (valuesInput.trim().startsWith('[')) {
                            // JSON Array
                            try {
                                values = JSON.parse(valuesInput);
                            } catch (e) {
                                values = [valuesInput];
                            }
                        } else if (valuesInput.includes(',')) {
                            // Comma separated
                            values = valuesInput.split(',').map((v: string) => v.trim());
                        } else {
                            // Single value (e.g. contextData.summary)
                            values = [valuesInput];
                        }

                        // If values is a 1D array, wrap it to make it a row for append
                        if (!Array.isArray(values[0])) {
                            values = [values];
                        }

                        logs.push(`Appending to Sheet (${sheetId}), Range: ${range}`);
                        logs.push(`Payload: ${JSON.stringify(values)}`);

                        // Auth
                        const { google } = require('googleapis');
                        const path = require('path');
                        const fs = require('fs');

                        let authOptions: any = {
                            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                        };

                        const localKeyFile = path.join(process.cwd(), 'service-account.json');
                        if (fs.existsSync(localKeyFile)) {
                            console.log("Found local service-account.json");
                            authOptions.keyFile = localKeyFile;
                        } else if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                            console.warn("No GOOGLE_APPLICATION_CREDENTIALS env var and no service-account.json found.");
                        }

                        const auth = new google.auth.GoogleAuth(authOptions);
                        const authClient = await auth.getClient();
                        const sheets = google.sheets({ version: 'v4', auth: authClient });

                        await sheets.spreadsheets.values.append({
                            spreadsheetId: sheetId,
                            range: range,
                            valueInputOption: 'USER_ENTERED',
                            requestBody: {
                                values: values,
                            },
                        });

                        logs.push("Successfully appended row to Google Sheet");

                    } catch (error: any) {
                        console.error("Google Sheets Execution Error:", error);
                        logs.push(`Google Sheets Execution Failed: ${error.message}`);
                        contextData.error = error.message;
                    }
                    break;

                case 'email':
                case 'Email Sender':
                    try {
                        logs.push(`Executing Email Node`);
                        const to = currentNode.data.emailTo;
                        const subject = currentNode.data.emailSubject || "Workflow Notification";
                        let body = currentNode.data.emailBody || contextData.summary || "No content provided";

                        if (!to) {
                            throw new Error("Recipient email (To) is missing");
                        }
                        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                            throw new Error("Server Email Credentials (EMAIL_USER, EMAIL_PASS) are missing");
                        }

                        logs.push(`Sending Email to ${to}...`);

                        const nodemailer = require('nodemailer');
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: process.env.EMAIL_USER,
                                pass: process.env.EMAIL_PASS,
                            },
                        });

                        const info = await transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: to,
                            subject: subject,
                            html: body.replace(/\n/g, '<br>'),
                            text: body
                        });

                        logs.push(`Email Sent Successfully. Message ID: ${info.messageId}`);

                    } catch (error: any) {
                        console.error("Email Execution Error:", error);
                        logs.push(`Email Execution Failed: ${error.message}`);
                    }
                    break;

                case 'gmailTrigger':
                case 'Gmail Trigger':
                    try {
                        logs.push(`Executing Gmail Trigger`);
                        logs.push(`Connecting to Gmail IMAP...`);

                        // Use existing EMAIL_USER/PASS from env
                        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                            throw new Error("Server Email Credentials (EMAIL_USER, EMAIL_PASS) are missing");
                        }

                        const imaps = require('imap-simple');
                        const simpleParser = require('mailparser').simpleParser;

                        const config = {
                            imap: {
                                user: process.env.EMAIL_USER,
                                password: process.env.EMAIL_PASS,
                                host: 'imap.gmail.com',
                                port: 993,
                                tls: true,
                                tlsOptions: { rejectUnauthorized: false }, // Fix for self-signed certificate error
                                authTimeout: 3000,
                            },
                        };

                        let connection: any = null;
                        try {
                            connection = await imaps.connect(config);
                            await connection.openBox('INBOX');

                            const searchCriteria = ['UNSEEN'];
                            const fetchOptions = {
                                bodies: ['HEADER', 'TEXT'],
                                markSeen: true,
                            };

                            const messages = await connection.search(searchCriteria, fetchOptions);

                            if (messages.length === 0) {
                                logs.push("No unread emails found.");
                                contextData.body = "No email found";
                                contextData.subject = "No Subject";
                                contextData.from = "Unknown";
                            } else {
                                // Get the last message (newest)
                                const latestMessage = messages[messages.length - 1];

                                // We already fetched 'HEADER' and 'TEXT', so the data is in latestMessage.parts
                                const allParts = latestMessage.parts;
                                const headerPart = allParts.find((p: any) => p.which === 'HEADER');
                                const textPart = allParts.find((p: any) => p.which === 'TEXT');

                                const header = headerPart ? headerPart.body : '';
                                const text = textPart ? textPart.body : '';

                                // Combine to create a raw-like message for simpleParser
                                const fullRawMessage = `${header}\r\n\r\n${text}`;

                                // Parse the raw message
                                const parsed = await simpleParser(fullRawMessage);

                                // improved fallback for subject if parser fails (though parser should work on raw headers)
                                const subjectFromParts = headerPart?.body?.subject?.[0];

                                contextData.subject = parsed.subject || subjectFromParts || "No Subject";
                                contextData.body = parsed.text || parsed.html || text || "No Content";
                                contextData.from = parsed.from?.text || "Unknown";

                                logs.push(`Fetched email: "${contextData.subject}" from ${contextData.from}`);
                            }
                        } finally {
                            if (connection) {
                                connection.end();
                            }
                        }

                    } catch (error: any) {
                        console.error("Gmail Trigger Error:", error);
                        logs.push(`Gmail Trigger Failed: ${error.message}`);
                        contextData.error = error.message;
                        // Avoid crashing the flow, just provide fallback data
                        contextData.body = "Error fetching email";
                    }
                    break;

                default:
                    logs.push(`Executed ${currentNode.data.label} (No logic defined)`);
            }

            // Queue Next Nodes
            const nextNodes = adjacencyList.get(currentNode.id);
            if (nextNodes) {
                nextNodes.forEach(nextId => {
                    executionQueue.push(nextId);
                });
            }

            // Simulate processing time
            await new Promise((resolve) => setTimeout(resolve, 300));
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
