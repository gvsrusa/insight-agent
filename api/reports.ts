import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getReports } from '../src/lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).send('Method not allowed');
    }

    try {
        const reports = await getReports();
        return res.status(200).json(reports);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch reports' });
    }
}
