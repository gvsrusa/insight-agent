import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Lightbulb, ExternalLink, Quote } from 'lucide-react';

interface ReportRendererProps {
    content: string;
}

export function ReportRenderer({ content }: ReportRendererProps) {
    return (
        <div className="font-sans text-gray-200">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom Header 1 (Title)
                    h1: ({ node, ...props }) => (
                        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-6 mt-8 pb-2 border-b border-gray-700/50" {...props} />
                    ),
                    // Custom Header 2 (Section)
                    h2: ({ node, ...props }) => (
                        <h2 className="text-xl md:text-2xl font-bold text-gray-100 mb-4 mt-8 flex items-center gap-2" {...props} />
                    ),
                    // Custom Header 3 (Sub-section)
                    h3: ({ node, ...props }) => (
                        <h3 className="text-lg font-semibold text-blue-300 mb-2 mt-4" {...props} />
                    ),
                    // Custom Paragraph
                    p: ({ node, ...props }) => (
                        <p className="text-gray-300 leading-relaxed mb-4 text-base" {...props} />
                    ),
                    // "Insight Card" (Blockquote)
                    blockquote: ({ node, ...props }) => (
                        <div className="my-6 p-4 md:p-6 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-l-4 border-blue-500 rounded-r-xl shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Quote className="w-16 h-16 text-blue-400 rotate-12" />
                            </div>
                           <div className="flex gap-3 relative z-10">
                                <Lightbulb className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
                                <div className="italic text-gray-200 font-medium">
                                    {props.children}
                                </div>
                           </div>
                        </div>
                    ),
                    // Styled Tables
                    table: ({ node, ...props }) => (
                        <div className="my-6 overflow-x-auto rounded-xl border border-gray-700 shadow-xl bg-gray-900/50">
                            <table className="w-full text-left border-collapse" {...props} />
                        </div>
                    ),
                    thead: ({ node, ...props }) => (
                        <thead className="bg-gray-800/80 text-gray-200" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                        <th className="p-3 md:p-4 text-sm font-semibold border-b border-gray-700 whitespace-nowrap" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                        <td className="p-3 md:p-4 text-sm border-b border-gray-800 text-gray-300 group-hover:bg-white/5" {...props} />
                    ),
                    tr: ({ node, ...props }) => (
                         <tr className="hover:bg-white/5 transition-colors group" {...props} />
                    ),
                    // Custom Link
                    a: ({ node, ...props }) => (
                        <a 
                            className="text-blue-400 hover:text-blue-300 underline decoration-blue-500/30 hover:decoration-blue-400 transition-all inline-flex items-center gap-0.5" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            {...props} 
                        >
                            {props.children}
                            <ExternalLink className="w-3 h-3 opacity-50" />
                        </a>
                    ),
                    // Enhanced Lists
                    ul: ({ node, ...props }) => (
                        <ul className="list-disc list-outside ml-5 space-y-2 mb-4 text-gray-300 marker:text-blue-500" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol className="list-decimal list-outside ml-5 space-y-2 mb-4 text-gray-300 marker:text-blue-500 marker:font-bold" {...props} />
                    ),
                    // Code Blocks
                     code: ({ node, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match;
                        return isInline ? (
                            <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-300 border border-gray-700" {...props}>
                                {children}
                            </code>
                        ) : (
                             <div className="rounded-lg overflow-hidden border border-gray-700 my-4 bg-gray-950 shadow-inner">
                                <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-800 text-xs text-gray-500 font-mono flex justify-between">
                                    <span>{match?.[1] || 'code'}</span>
                                </div>
                                <code className="block p-4 overflow-x-auto text-sm font-mono text-gray-300" {...props}>
                                    {children}
                                </code>
                             </div>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
