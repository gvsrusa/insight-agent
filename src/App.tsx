import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useResearch } from './hooks/useResearch';
import { Github, Loader2, Search, Send, Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';

function App() {
  const [topic, setTopic] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { startResearch, status, report, isLoading, logs } = useResearch();
  
  // Local state to override report view when clicking history
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Active report is either the one being generated OR the one selected from history
  const displayReport = isLoading ? report : (selectedReport || report);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      setSelectedReport(null); // Clear history selection
      startResearch(topic);
      setIsSidebarOpen(false); // Close sidebar on mobile if open
    }
  };

  const handleSelectReport = (content: string) => {
      setSelectedReport(content);
      setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-[100dvh] bg-gray-900 text-gray-100 flex flex-col font-sans h-[100dvh] overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-800 p-4 bg-gray-950/50 backdrop-blur shrink-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent hidden sm:block">
              InsightAgent
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-full border border-green-900/50 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="hidden sm:inline">Online</span>
            </span>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <Github className="w-6 h-6" />
            </a>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar (Desktop) */}
        <div className="hidden md:block h-full shrink-0 z-10">
            <Sidebar onSelectReport={handleSelectReport} />
        </div>

        {/* Sidebar (Mobile Drawer) */}
        {isSidebarOpen && (
            <div className="absolute inset-0 z-30 md:hidden">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[320px] shadow-2xl animate-in slide-in-from-left duration-200">
                    <Sidebar 
                        onSelectReport={handleSelectReport} 
                        onClose={() => setIsSidebarOpen(false)} 
                        className="w-full border-r-0"
                    />
                </div>
            </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden w-full max-w-[100vw]">
            
            {/* Left Col: Input & Report */}
            <div className="lg:col-span-2 space-y-6 flex flex-col h-full overflow-hidden">
            
            {/* Search Input */}
            <div className="bg-gray-800/50 p-4 md:p-6 rounded-2xl border border-gray-700/50 shadow-xl shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2 md:gap-4">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Research topic..."
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500 min-w-0"
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !topic.trim()}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 md:px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    <span className="hidden sm:inline">Research</span>
                </button>
                </form>
            </div>

            {/* Report Display */}
            <div className="flex-1 bg-gray-800/30 rounded-2xl border border-gray-700/50 p-4 md:p-8 overflow-y-auto custom-scrollbar">
                {displayReport ? (
                <div className="prose prose-invert prose-blue max-w-none prose-sm md:prose-base">
                    <ReactMarkdown>{displayReport}</ReactMarkdown>
                </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 text-center">
                        <Search className="w-12 h-12 md:w-16 md:h-16 opacity-20" />
                        <p className="text-sm md:text-base">Enter a topic to generate a comprehensive research report.</p>
                    </div>
                )}
            </div>
            </div>

            {/* Right Col: Agent Logs (Hidden on mobile by default) */}
            <div className="hidden lg:flex lg:col-span-1 bg-black/20 rounded-2xl border border-gray-800 p-6 overflow-hidden flex-col h-full">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Agent Live Feed
                </h2>
                
                <div className="flex-1 overflow-y-auto space-y-3 font-mono text-sm custom-scrollbar">
                    {logs.length === 0 && (
                        <div className="text-gray-600 italic">Agent is ready...</div>
                    )}
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-3 text-gray-300 animate-fade-in">
                            <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
                            <span>{log}</span>
                        </div>
                    ))}
                </div>

                {isLoading && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-xs flex items-center justify-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin"/>
                        Processing: {status}
                    </div>
                )}
            </div>

        </main>
      </div>
    </div>
  );
}

export default App;
