import { getReports } from '../src/lib/storage.js';

export default async function handler(req: Request) {
    if (req.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const reports = await getReports();
        return new Response(JSON.stringify(reports), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch reports' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
