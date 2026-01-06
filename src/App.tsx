import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useResearch } from './hooks/useResearch';
import { Github, Loader2, Search, Send } from 'lucide-react';
import { Sidebar } from './components/Sidebar';

function App() {
  const [topic, setTopic] = useState('');
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
    }
  };

  const handleSelectReport = (content: string) => {
      setSelectedReport(content);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans h-screen overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-800 p-4 bg-gray-950/50 backdrop-blur shrink-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              InsightAgent
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-full border border-green-900/50">
                Online
             </span>
             <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-6 h-6" />
             </a>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar (History) */}
        <div className="hidden md:block h-full">
            <Sidebar onSelectReport={handleSelectReport} />
        </div>

        {/* Content Area */}
        <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
            
            {/* Left Col: Input & Report */}
            <div className="lg:col-span-2 space-y-6 flex flex-col h-full overflow-hidden">
            
            {/* Search Input */}
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="What do you want to research today?"
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500"
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !topic.trim()}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Research
                </button>
                </form>
            </div>

            {/* Report Display */}
            <div className="flex-1 bg-gray-800/30 rounded-2xl border border-gray-700/50 p-8 overflow-y-auto custom-scrollbar">
                {displayReport ? (
                <div className="prose prose-invert prose-blue max-w-none">
                    <ReactMarkdown>{displayReport}</ReactMarkdown>
                </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                        <Search className="w-16 h-16 opacity-20" />
                        <p>Enter a topic to generate a comprehensive research report.</p>
                    </div>
                )}
            </div>
            </div>

            {/* Right Col: Agent Logs */}
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
