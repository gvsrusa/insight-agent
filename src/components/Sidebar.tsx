import { useEffect, useState } from 'react';
import { Clock, FileText, X } from 'lucide-react';
import type { Report } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  onSelectReport: (content: string) => void;
  onClose?: () => void;
  className?: string;
  currentReportId?: number;
}

export function Sidebar({ onSelectReport, onClose, className }: SidebarProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // Poll every 10s to see new reports
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("w-80 border-r border-gray-800 bg-gray-950/95 flex flex-col h-full", className)}>
      <div className="p-4 border-b border-gray-800 flex items-center justify-between text-gray-400">
        <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">History</span>
        </div>
        {onClose && (
            <button onClick={onClose} className="md:hidden p-1 hover:text-white">
                <X className="w-5 h-5" />
            </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {loading && <div className="text-center text-gray-600 p-4">Loading history...</div>}
        
        {!loading && reports.length === 0 && (
          <div className="text-center text-gray-600 p-4 text-sm">No research history yet.</div>
        )}

        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => {
                onSelectReport(report.content);
                if (onClose) onClose();
            }}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-800/50 transition-colors group flex flex-col gap-1"
          >
            <div className="flex items-start justify-between gap-2">
                <span className="text-gray-200 font-medium text-sm line-clamp-2 leading-tight">
                {report.topic}
                </span>
                <FileText className="w-3 h-3 text-gray-600 shrink-0 mt-1" />
            </div>
            <span className="text-xs text-gray-600">
              {new Date(report.created_at).toLocaleDateString()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
