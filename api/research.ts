import { agent } from '../src/agent/graph.js';
import { saveReport } from '../src/lib/storage.js';

export const config = {
    duration: 60, // allow longer timeout
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const { topic } = await req.json();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            let fullReport = "";
            try {
                const streamEvents = await agent.stream({ topic }, { streamMode: "updates" });

                for await (const event of streamEvents) {
                    if (event.research) {
                        const logs = event.research.logs;
                        const lastLog = logs ? logs[logs.length - 1] : "Researching...";
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: lastLog })}\n\n`));
                    }
                    if (event.write) {
                        const logs = event.write.logs;
                        const lastLog = logs ? logs[logs.length - 1] : "Finalizing...";
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: lastLog })}\n\n`));

                        const report = event.write.report;
                        if (report) {
                            fullReport = report;
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: report })}\n\n`));
                        }
                    }
                }

                // Save to DB (async, might not block stream close but should await ideally)
                if (fullReport) {
                    try {
                        await saveReport(topic, fullReport, []);
                    } catch (err) {
                        console.error("Failed to save report to DB", err);
                    }
                }

                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`));
                controller.close();
            } catch (e) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: String(e) })}\n\n`));
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
