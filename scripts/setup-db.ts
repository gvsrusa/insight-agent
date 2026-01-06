import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    try {
        await sql`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        topic TEXT NOT NULL,
        content TEXT NOT NULL,
        sources JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
        console.log('Created "reports" table.');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

main();
