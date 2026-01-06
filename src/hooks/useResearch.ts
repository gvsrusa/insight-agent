import { useState } from 'react';

export interface StreamUpdate {
    type: 'status' | 'text' | 'chunk' | 'complete' | 'error';
    message?: string;
    content?: string;
    reportId?: string;
}

export function useResearch() {
    const [status, setStatus] = useState<string>('Idle');
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const startResearch = async (topic: string) => {
        setIsLoading(true);
        setReport('');
        setLogs([]);
        setStatus('Starting research...');

        try {
            const response = await fetch('/api/research', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic }),
            });

            if (!response.ok) throw new Error(response.statusText);

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6)) as StreamUpdate;

                        if (data.type === 'status') {
                            setStatus(data.message || '');
                            setLogs(prev => [...prev, data.message || '']);
                        } else if (data.type === 'text' || data.type === 'chunk') {
                            setReport(prev => prev + (data.content || ''));
                        } else if (data.type === 'complete') {
                            setIsLoading(false);
                            setStatus('Complete');
                        } else if (data.type === 'error') {
                            console.error(data.message);
                            setLogs(prev => [...prev, `Error: ${data.message}`]);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            setIsLoading(false);
            setStatus('Error occurred');
        }
    };

    return { startResearch, status, report, isLoading, logs };
}
