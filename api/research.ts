import { agent } from '../src/agent/graph.js';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const { topic } = await req.json();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                const streamEvents = await agent.stream({ topic }, { streamMode: "updates" });

                for await (const event of streamEvents) {
                    // Check for log updates or final report
                    // event format depends on streamMode
                    // Simple mapping for demo:
                    if (event.research) {
                        const logs = event.research.logs;
                        const lastLog = logs ? logs[logs.length - 1] : "Researching...";
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: lastLog })}\n\n`));
                    }
                    if (event.write) {
                        const logs = event.write.logs;
                        const lastLog = logs ? logs[logs.length - 1] : "Values generated.";
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: lastLog })}\n\n`));

                        const report = event.write.report;
                        if (report) {
                            // Chunk the report for effect or send whole
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: report })}\n\n`));
                        }
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
