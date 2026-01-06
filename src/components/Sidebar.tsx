import { useEffect, useState } from 'react';
import { Clock, FileText, Trash2, X, CheckSquare, Square, MoreVertical, Copy, AlertTriangle } from 'lucide-react';
import type { Report } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  onSelectReport: (content: string) => void;
  onClose?: () => void;
  className?: string;
  currentReportId?: number;
  refreshTrigger?: number;
}

export function Sidebar({ onSelectReport, onClose, className, refreshTrigger }: SidebarProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

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
  }, [refreshTrigger]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleSelection = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const deleteReports = async (ids: number[]) => {
    try {
      await fetch('/api/reports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      fetchReports();
      return true;
    } catch (e) {
      console.error("Failed to delete", e);
      return false;
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} report(s)?`)) return;
    
    await deleteReports(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const handleDeleteAll = async () => {
    if (!confirm("⚠️ Are you sure you want to delete ALL research history? This cannot be undone.")) return;
    const allIds = reports.map(r => r.id as number);
    await deleteReports(allIds);
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  return (
    <div className={cn("w-80 border-r border-gray-800 bg-gray-950/95 flex flex-col h-full", className)}>
      <div className="p-4 border-b border-gray-800 flex flex-col gap-3">
        <div className="flex items-center justify-between text-gray-400">
            <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">History</span>
            </div>
            {/* Desktop Actions */}
            <div className="flex items-center gap-1">
                {!isSelectionMode && reports.length > 0 && (
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

        {/* Selection Mode Actions */}
        {isSelectionMode && (
             <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200 bg-gray-900/50 p-3 rounded-lg border border-gray-800/50">
                <div className="flex gap-2">
                    <button 
                        onClick={handleDeleteSelected}
                        disabled={selectedIds.size === 0}
                        className="flex-1 py-1.5 px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded text-xs font-bold transition-colors disabled:opacity-30 border border-red-500/20"
                    >
                        Delete Selected ({selectedIds.size})
                    </button>
                    <button onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <button 
                    onClick={handleDeleteAll}
                    className="w-full py-1.5 px-3 bg-red-900/20 text-red-500 hover:bg-red-900/40 rounded text-xs font-bold transition-colors border border-red-900/30 flex items-center justify-center gap-2"
                >
                    <AlertTriangle className="w-3 h-3" />
                    Delete All History
                </button>
             </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {loading && <div className="text-center text-gray-600 p-4">Loading history...</div>}
        
        {!loading && reports.length === 0 && (
          <div className="text-center text-gray-600 p-4 text-sm">No research history yet.</div>
        )}

        {reports.map((report) => (
          <div key={report.id} className="relative group">
              {isSelectionMode && (
                  <div className="absolute left-2 top-3 z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSelection(report.id as number); }}>
                      {selectedIds.has(report.id as number) ? 
                        <CheckSquare className="w-4 h-4 text-blue-500 bg-gray-900 rounded" /> : 
                        <Square className="w-4 h-4 text-gray-500 hover:text-gray-300 bg-gray-900/50" />
                      }
                  </div>
              )}
              
              <div
                onClick={() => {
                    if (isSelectionMode) toggleSelection(report.id as number);
                    else {
                        onSelectReport(report.content);
                        if (onClose) onClose();
                    }
                }}
                className={cn(
                    "cursor-pointer w-full text-left p-3 rounded-lg hover:bg-gray-800/50 transition-colors flex flex-col gap-1 pr-8 relative",
                    isSelectionMode ? "pl-8" : "",
                    selectedIds.has(report.id as number) ? "bg-gray-800/80 ring-1 ring-blue-500/30" : ""
                )}
              >
                <div className="flex items-start justify-between gap-2 overflow-hidden">
                    <span className="text-gray-200 font-medium text-sm line-clamp-2 leading-tight">
                    {report.topic}
                    </span>
                    {!isSelectionMode && <FileText className="w-3 h-3 text-gray-600 shrink-0 mt-1" />}
                </div>
                <span className="text-xs text-gray-600">
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>

            {/* Three Dot Menu (Only when NOT in selecting mode) */}
            {!isSelectionMode && (
                <div className="absolute right-2 top-3 z-10" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => setOpenMenuId(openMenuId === report.id ? null : report.id as number)}
                        className="p-1 text-gray-500 hover:text-white hover:bg-gray-700/50 rounded transition-colors opacity-0 group-hover:opacity-100 data-[open=true]:opacity-100"
                        data-open={openMenuId === report.id}
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {/* Dropdown */}
                    {openMenuId === report.id && (
                        <div className="absolute right-0 mt-1 w-32 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(report.content);
                                    setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                            >
                                <Copy className="w-3 h-3" /> Copy
                            </button>
                            <button 
                                onClick={async () => {
                                    if(confirm('Delete this report?')) {
                                        await deleteReports([report.id as number]);
                                    }
                                    setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-gray-800 flex items-center gap-2"
                            >
                                <Trash2 className="w-3 h-3" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
