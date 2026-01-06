import type { VercelRequest, VercelResponse } from '@vercel/node';
import { agent } from '../src/agent/graph.js';
import { saveReport } from '../src/lib/storage.js';

// Allow longer timeout (Vercel Pro: 300s, Hobby: 10s-60s)
export const maxDuration = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

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
            try {
                await saveReport(topic, fullReport, []);
            } catch (err) {
                console.error("Failed to save report to DB", err);
            }
        }

        res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
        res.end();
    } catch (e) {
        console.error(e);
        res.write(`data: ${JSON.stringify({ type: 'error', message: String(e) })}\n\n`);
        res.end();
    }
}
