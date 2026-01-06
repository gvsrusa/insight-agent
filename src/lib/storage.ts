import { sql } from '@vercel/postgres';
import type { Report } from '../types.js';

export async function saveReport(topic: string, content: string, sources: any[] = []) {
    try {
        const result = await sql`
      INSERT INTO reports (topic, content, sources)
      VALUES (${topic}, ${content}, ${JSON.stringify(sources)})
      RETURNING id;
    `;
        return result.rows[0]?.id as number;
    } catch (error) {
        console.error('Failed to save report:', error);
        return null;
    }
}

export async function getReports(): Promise<Report[]> {
    try {
        const result = await sql`
      SELECT * FROM reports ORDER BY created_at DESC;
    `;
        return result.rows as unknown as Report[];
    } catch (error) {
        console.error('Failed to fetch reports:', error);
        return [];
    }
}

export async function deleteReports(ids: number[]) {
    try {
        // execute reliable individual deletes
        await Promise.all(ids.map(id => sql`DELETE FROM reports WHERE id = ${id}`));
        return true;
    } catch (error) {
        console.error('Failed to delete reports:', error);
        return false;
    }
}
