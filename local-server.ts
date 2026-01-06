import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Load env vars BEFORE importing the agent graph (which reads process.env)
dotenv.config();

// Dynamic imports to ensure env vars are loaded first
const { agent } = await import('./src/agent/graph.js');
const { saveReport, getReports } = await import('./src/lib/storage.js');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/reports', async (req, res) => {
    const reports = await getReports();
    res.json(reports);
});

app.post('/api/research', async (req, res) => {
    const { topic } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullReport = "";

    try {
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
                    }
                }
            }
        }

        // Save to DB
        if (fullReport) {
            await saveReport(topic, fullReport, []);
        }

        res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
        res.end();
    } catch (e) {
        console.error(e);
        res.write(`data: ${JSON.stringify({ type: 'error', message: String(e) })}\n\n`);
        res.end();
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Local API server running on http://localhost:${PORT}`);
});
