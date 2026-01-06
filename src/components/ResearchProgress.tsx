import { Loader2, Globe, Brain, PenTool } from 'lucide-react';
import { cn } from '../lib/utils';
import { useMemo } from 'react';

interface ResearchProgressProps {
    status: string;
    logs: string[];
}

export function ResearchProgress({ status, logs }: ResearchProgressProps) {
    // Determine the current phase based on status/logs
    // Simple heuristic: "Searching" -> Phase 1, "Synthesizing" or "Writing" -> Phase 2 (but this component is mostly for Phase 1/Early Phase 2)
    
    // We'll show the last log more prominently
    const lastLog = logs.length > 0 ? logs[logs.length - 1] : status;

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 space-y-8 animate-in fade-in duration-500">
            {/* Animated Centerpiece */}
            <div className="relative">
                {/* Background glow */}
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse rounded-full" />
                
                <div className="relative flex items-center justify-center w-24 h-24 bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl ring-1 ring-white/10">
                    <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                </div>
            </div>

            {/* Status Text */}
            <div className="text-center space-y-2 max-w-md">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">
                    AI Agent Active
                </h2>
                <div className="h-16 flex items-center justify-center">
                    <p className="text-gray-400 font-medium animate-pulse">
                         {lastLog || "Initializing..."}
                    </p>
                </div>
            </div>

            {/* Steps Visualization */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors", 
                    status.toLowerCase().includes('search') || status.toLowerCase().includes('research') ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-gray-800/30"
                )}>
                    <Globe className="w-3.5 h-3.5" />
                    <span>Research</span>
                </div>
                <div className="w-4 h-px bg-gray-800" />
                 <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors", 
                    status.toLowerCase().includes('analyz') ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-gray-800/30"
                )}>
                    <Brain className="w-3.5 h-3.5" />
                    <span>Analyze</span>
                </div>
                <div className="w-4 h-px bg-gray-800" />
                 <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors", 
                    status.toLowerCase().includes('writ') || status.toLowerCase().includes('synth') ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-gray-800/30"
                )}>
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Write</span>
                </div>
            </div>
        </div>
    );
}
