import { useEffect, useState } from 'react';
import { Clock, FileText, Trash2, X, CheckSquare, Square } from 'lucide-react';
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
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

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
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleSelection = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} report(s)?`)) return;

    try {
      await fetch('/api/reports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      fetchReports();
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  return (
    <div className={cn("w-80 border-r border-gray-800 bg-gray-950/95 flex flex-col h-full", className)}>
      <div className="p-4 border-b border-gray-800 flex items-center justify-between text-gray-400">
        <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">History</span>
        </div>
        <div className="flex items-center gap-1">
            {isSelectionMode ? (
                <>
                    <button 
                        onClick={deleteSelected}
                        disabled={selectedIds.size === 0}
                        className="p-1 px-2 text-red-400 hover:bg-red-900/30 rounded text-xs font-bold transition-colors disabled:opacity-50"
                    >
                        Delete ({selectedIds.size})
                    </button>
                    <button onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }} className="p-1 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </>
            ) : (
                <button onClick={() => setIsSelectionMode(true)} className="p-1 hover:text-white" title="Manage">
                   <Trash2 className="w-4 h-4" />
                </button>
            )}
            
            {onClose && (
                <button onClick={onClose} className="md:hidden p-1 hover:text-white ml-2">
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {loading && <div className="text-center text-gray-600 p-4">Loading history...</div>}
        
        {!loading && reports.length === 0 && (
          <div className="text-center text-gray-600 p-4 text-sm">No research history yet.</div>
        )}

        {reports.map((report) => (
          <div key={report.id} className="relative group">
              {isSelectionMode && (
                  <div className="absolute left-2 top-3 z-10" onClick={(e) => { e.stopPropagation(); toggleSelection(report.id as number); }}>
                      {selectedIds.has(report.id as number) ? 
                        <CheckSquare className="w-4 h-4 text-blue-500 bg-gray-900" /> : 
                        <Square className="w-4 h-4 text-gray-500 hover:text-gray-300 bg-gray-900/50" />
                      }
                  </div>
              )}
              <button
                onClick={() => {
                    if (isSelectionMode) toggleSelection(report.id as number);
                    else {
                        onSelectReport(report.content);
                        if (onClose) onClose();
                    }
                }}
                className={cn(
                    "w-full text-left p-3 rounded-lg hover:bg-gray-800/50 transition-colors flex flex-col gap-1",
                    isSelectionMode ? "pl-8" : "",
                    selectedIds.has(report.id as number) ? "bg-gray-800/80" : ""
                )}
              >
                <div className="flex items-start justify-between gap-2">
                    <span className="text-gray-200 font-medium text-sm line-clamp-2 leading-tight">
                    {report.topic}
                    </span>
                    {!isSelectionMode && <FileText className="w-3 h-3 text-gray-600 shrink-0 mt-1" />}
                </div>
                <span className="text-xs text-gray-600">
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </button>
          </div>
        ))}
      </div>
    </div>
  );
}
