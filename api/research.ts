import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleResearchRequest } from '../src/lib/research-controller.js';

// Allow longer timeout (Vercel Pro: 300s, Hobby: 10s-60s)
export const maxDuration = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    const { topic } = req.body;
    await handleResearchRequest(topic, res);
}
