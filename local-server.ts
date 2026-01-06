import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Load env vars BEFORE importing the agent graph (which reads process.env)
dotenv.config();

// Dynamic imports to ensure env vars are loaded first
const { handleResearchRequest } = await import('./src/lib/research-controller.js');
const { getReports, deleteReports } = await import('./src/lib/storage.js');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/reports', async (req, res) => {
    const reports = await getReports();
    res.json(reports);
});

app.delete('/api/reports', async (req, res) => {
    const { ids } = req.body;
    await deleteReports(ids);
    res.json({ success: true });
});

app.post('/api/research', async (req, res) => {
    const { topic } = req.body;
    await handleResearchRequest(topic, res);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Local API server running on http://localhost:${PORT}`);
});
