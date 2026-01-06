import { agent } from '../agent/graph.js';
import { saveReport } from './storage.js';

/**
 * Shared controller logic for handling research requests.
 * Compatible with both Vercel Serverless Functions and Express (local).
 */
export async function handleResearchRequest(topic: string, res: any) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullReport = "";

    try {
        // Use v2 streaming to get internal events (chunks)
        const streamEvents = await agent.streamEvents({ topic }, { version: "v2" });

        for await (const event of streamEvents) {
            // Status Updates from Node Start events
            if (event.event === "on_chain_start") {
                if (event.name === "research") {
                    res.write(`data: ${JSON.stringify({ type: 'status', message: "Searching the web..." })}\n\n`);
                } else if (event.name === "write") {
                    res.write(`data: ${JSON.stringify({ type: 'status', message: "Synthesizing report..." })}\n\n`);
                }
            }

            // Real-time Content Streaming
            if (event.event === "on_chat_model_stream") {
                const chunk = event.data.chunk;
                if (chunk && chunk.content) {
                    const content = typeof chunk.content === 'string' ? chunk.content : '';
                    if (content) {
                        fullReport += content;
                        res.write(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`);
                        // Optional flush for Vercel/proxies
                        if (typeof res.flush === 'function') res.flush();
                    }
                }
            }
        }

        // Save to DB
        if (fullReport) {
            try {
                await saveReport(topic, fullReport, []);
            } catch (err) {
                console.error("Failed to save report to DB", err);
            }
        }

        res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
        res.end();
    } catch (e) {
        console.error("Research Error:", e);
        res.write(`data: ${JSON.stringify({ type: 'error', message: String(e) })}\n\n`);
        res.end();
    }
}
