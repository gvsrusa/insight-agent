import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Load env vars BEFORE importing the agent graph (which reads process.env)
dotenv.config();

const { agent } = await import('./src/agent/graph');
const { saveReport, getReports } = await import('./src/lib/storage');

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
        const streamEvents = await agent.stream({ topic }, { streamMode: "updates" });

        for await (const event of streamEvents) {
            if (event.research) {
                const logs = event.research.logs;
                const lastLog = logs ? logs[logs.length - 1] : "Researching...";
                res.write(`data: ${JSON.stringify({ type: 'status', message: lastLog })}\n\n`);
            }
            if (event.write) {
                const logs = event.write.logs;
                const lastLog = logs ? logs[logs.length - 1] : "Finalizing...";
                res.write(`data: ${JSON.stringify({ type: 'status', message: lastLog })}\n\n`);

                const report = event.write.report;
                if (report) {
                    fullReport = report;
                    res.write(`data: ${JSON.stringify({ type: 'text', content: report })}\n\n`);
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
