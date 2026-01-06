# Product Requirements Document
## InsightAgent: Autonomous Research & Intelligence Agent

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Date** | January 6, 2026 |
| **Author** | InsightAgent Development Team |
| **Status** | Draft |

---

## 1. Executive Summary

InsightAgent is a web-based autonomous research assistant that leverages open-source AI models to perform intelligent web research and compile structured reports. Built with a modern React + Vite frontend and LangGraph.js backend, it demonstrates sophisticated agentic workflow capabilities while maintaining cost efficiency through free-tier services.

### Key Value Propositions

- Autonomous multi-step research with real-time progress visualization
- Privacy-focused web search using DuckDuckGo API (free, no API key required)
- Access to state-of-the-art LLMs via OpenRouter's free model tier
- Serverless PostgreSQL database with Neon/Vercel Postgres free tier
- Streaming responses for optimal user experience on serverless infrastructure

---

## 2. Project Overview

### 2.1 Project Information

| Field | Value |
|-------|-------|
| **Project Name** | InsightAgent |
| **Target Audience** | Technical Interviewers, Demo Audiences |
| **Primary Use Case** | Demonstrate Agentic AI Workflow |
| **Deployment Target** | Vercel (Frontend + Serverless) |
| **Estimated Dev Time** | 2-3 weeks |

### 2.2 Goals & Objectives

**Primary Goal:** Create a fully functional research agent that demonstrates agentic AI capabilities for interview demonstrations and portfolio showcasing.

**Secondary Goals:**
- Showcase proficiency in modern React/TypeScript development
- Demonstrate understanding of LLM orchestration frameworks (LangGraph.js)
- Implement production-ready streaming architecture
- Maintain zero operational costs using free-tier services

---

## 3. Technical Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React + Vite | Fast HMR, TypeScript support, optimal builds |
| **Styling** | Tailwind CSS | Rapid UI development, consistent design |
| **Agent Framework** | LangGraph.js | Native JS, runs on Vercel, full ecosystem |
| **LLM Provider** | OpenRouter | Free tier models, OpenAI-compatible API |
| **Search Tool** | DuckDuckGo | Free, no API key, privacy-focused |
| **Database** | Neon (Vercel) | Serverless Postgres, generous free tier |
| **Deployment** | Vercel | Zero-config, automatic scaling, free tier |

### 3.1 Frontend: React + Vite

Vite provides a modern build tool with near-instant hot module replacement (HMR) and optimized production builds. Combined with React and TypeScript, it offers type-safe component development with excellent developer experience.

**Setup Command:**
```bash
npm create vite@latest research-agent -- --template react-ts
```

**Key Dependencies:**
- `react-markdown`: Render formatted research reports
- `lucide-react`: Modern icon library
- `tailwindcss`: Utility-first CSS framework

### 3.2 Agent Framework: LangGraph.js

LangGraph.js is a low-level orchestration framework for building stateful, multi-actor AI agents. It extends the LangChain ecosystem with cyclical graph support, enabling complex agentic workflows with durable execution, streaming, and human-in-the-loop capabilities.

**Key Features:**
- StateGraph abstraction for modeling agent workflows as graphs
- First-class streaming support with token-by-token output
- Built-in state management and persistence
- Compatible with OpenRouter's OpenAI-compatible API

### 3.3 Search Tool: DuckDuckGo

DuckDuckGo provides privacy-focused web search without requiring API keys. The `@langchain/community` package includes a built-in DuckDuckGoSearch tool that integrates seamlessly with LangGraph.js agents.

**Installation:**
```bash
npm install @langchain/community duck-duck-scrape
```

**Usage Example:**
```typescript
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";

const searchTool = new DuckDuckGoSearch({ maxResults: 5 });
const results = await searchTool.invoke("latest AI research 2024");
```

### 3.4 LLM Provider: OpenRouter

OpenRouter provides unified access to 400+ AI models through a single OpenAI-compatible API. Their free tier includes access to powerful models suitable for research tasks.

#### Recommended Free Models

| Model | Parameters | Best For |
|-------|------------|----------|
| `meta-llama/llama-3.3-70b-instruct:free` | 70B | General research |
| `deepseek/deepseek-r1:free` | 671B MoE | Reasoning tasks |
| `moonshotai/kimi-k2:free` | 1T (32B active) | Coding & tools |
| `openai/gpt-oss-20b:free` | 21B | Fast responses |
| `nvidia/nemotron-3-nano-30b-a3b:free` | 30B MoE | Agentic tasks |

**Configuration Example:**
```typescript
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  modelName: "meta-llama/llama-3.3-70b-instruct:free",
  openAIApiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
});
```

### 3.5 Database: Neon Postgres (via Vercel)

Vercel Postgres is powered by Neon, providing serverless PostgreSQL with automatic scaling. The free tier offers sufficient resources for demo applications with scale-to-zero capability to minimize costs.

#### Free Tier Limits

- **Storage:** 0.5 GB per project
- **Compute:** 100 CU-hours per project per month
- **Egress:** 5 GB per month
- **Projects:** Up to 100 projects
- **Branches:** 10 per project
- **Auto scale-to-zero** after 5 minutes of inactivity

#### Database Schema

```sql
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
```

---

## 4. User Flow & Experience

### 4.1 Demo Script

The application is designed to showcase agentic capabilities in a compelling, visual way for technical interviews.

1. **Landing** - User opens the app. No login required. Clean, professional interface.

2. **Input** - User types a research topic (e.g., "Comparison of open source vector databases 2024").

3. **Process (The "Wow" Moment)**
   - Live Agent Log appears on the right side
   - Real-time updates: "Searching web..." → "Analyzing results..." → "Refining search..." → "Generating report..."
   - Each step shows what the agent is "thinking"

4. **Output** - Formatted Markdown report streams on the left, with inline source citations.

5. **History** - Report auto-saves to Postgres. User can view "Past Reports" in sidebar.

### 4.2 UI Components

| Component | Description |
|-----------|-------------|
| **Input Form** | Text input with "Start Research" button. Disabled during active research. |
| **Agent Log Panel** | Real-time scrolling log showing agent status, searches performed, and reasoning steps. |
| **Report Display** | Markdown renderer (react-markdown) showing the final research report with formatted headings, lists, and links. |
| **History Sidebar** | Collapsible sidebar listing past reports. Click to view, includes delete option. |
| **Loading States** | Skeleton loaders, spinner animations, and progress indicators during processing. |

---

## 5. Functional Requirements

### 5.1 Agent Architecture (LangGraph StateGraph)

The research agent implements a cyclical graph with three primary nodes:

#### Node: Research
- Accepts research topic from user
- Constructs optimal search queries
- Executes DuckDuckGo searches
- Returns structured search results

#### Node: Analyze
- Processes search results through LLM
- Determines if sufficient information gathered
- Routes to either: additional Research or Write node
- Implements reasoning about information completeness

#### Node: Write
- Synthesizes all gathered information
- Generates structured Markdown report
- Includes source citations with links
- Streams output token-by-token

#### State Schema

```typescript
interface ResearchState {
  topic: string;
  searchQueries: string[];
  searchResults: SearchResult[];
  analysisNotes: string[];
  iterationCount: number;
  maxIterations: number;
  report: string;
  status: "researching" | "analyzing" | "writing" | "complete" | "error";
}
```

### 5.2 Streaming Implementation

Streaming is critical for serverless deployment. Vercel's free tier has a 10-second function timeout, but streaming keeps the connection alive and provides responsive UX.

#### Backend: Vercel AI SDK Integration

```typescript
import { streamText } from "ai";
import { createOpenRouter } from "@ai-sdk/openrouter";

export async function POST(req: Request) {
  const { topic } = await req.json();
  
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const result = await streamText({
    model: openrouter("meta-llama/llama-3.3-70b-instruct:free"),
    messages: [{ role: "user", content: `Research: ${topic}` }],
  });

  return result.toDataStreamResponse();
}
```

#### Frontend: useChat Hook

```typescript
import { useChat } from "ai/react";

function ResearchInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/research",
  });

  return (
    <form onSubmit={handleSubmit}>
      <input value={input} onChange={handleInputChange} />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Researching..." : "Start Research"}
      </button>
    </form>
  );
}
```

---

## 6. API Specification

### 6.1 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/research` | Start research, returns SSE stream |
| `GET` | `/api/reports` | List all saved reports |
| `GET` | `/api/reports/[id]` | Get single report by ID |
| `DELETE` | `/api/reports/[id]` | Delete report by ID |

### 6.2 Request/Response Examples

**POST /api/research - Request:**
```json
{
  "topic": "Best practices for React state management 2024",
  "maxIterations": 3
}
```

**POST /api/research - Stream Response (SSE):**
```
data: {"type":"status","message":"Searching web..."}
data: {"type":"status","message":"Found 5 relevant sources"}
data: {"type":"status","message":"Analyzing results..."}
data: {"type":"text","content":"# React State Management in 2024\n\n"}
data: {"type":"text","content":"## Overview\n\nReact state management has evolved..."}
data: {"type":"complete","reportId":"rpt_abc123"}
```

---

## 7. Development Roadmap

### 7.1 Phase 1: Project Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS
- [ ] Set up ESLint and Prettier
- [ ] Create Vercel project and link repository
- [ ] Configure environment variables

### 7.2 Phase 2: Database Setup
- [ ] Create Vercel Postgres database
- [ ] Define schema and run migrations
- [ ] Install @vercel/postgres package
- [ ] Create database utility functions
- [ ] Test local development with `vercel env pull`

### 7.3 Phase 3: Agent Development
- [ ] Install LangGraph.js and LangChain dependencies
- [ ] Configure OpenRouter client
- [ ] Implement DuckDuckGo search tool
- [ ] Build Research node
- [ ] Build Analyze node with conditional routing
- [ ] Build Write node with streaming output
- [ ] Create StateGraph and compile agent

### 7.4 Phase 4: API Routes
- [ ] Create `/api/research` streaming endpoint
- [ ] Create `/api/reports` CRUD endpoints
- [ ] Implement error handling and validation
- [ ] Add request logging

### 7.5 Phase 5: Frontend Development
- [ ] Build main layout with sidebar
- [ ] Create research input form
- [ ] Implement live agent log component
- [ ] Build Markdown report renderer
- [ ] Create report history sidebar
- [ ] Add loading states and animations

### 7.6 Phase 6: Testing & Deployment
- [ ] Manual testing of all flows
- [ ] Test streaming on Vercel preview
- [ ] Optimize for mobile responsiveness
- [ ] Deploy to production
- [ ] Document demo script

---

## 8. Environment Configuration

### 8.1 Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | API key from openrouter.ai |
| `POSTGRES_URL` | Yes | Auto-set by Vercel Postgres |
| `POSTGRES_PRISMA_URL` | Yes | Connection pooling URL |
| `POSTGRES_URL_NON_POOLING` | Optional | Direct connection URL |

### 8.2 Local Development Setup

```bash
# .env.local
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx

# Auto-populated by Vercel CLI (vercel env pull)
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
POSTGRES_USER=default
POSTGRES_HOST=ep-xxx.us-east-2.aws.neon.tech
POSTGRES_PASSWORD=xxxxxxxxxxxx
POSTGRES_DATABASE=verceldb
```

---

## 9. Deployment Strategy

### 9.1 Vercel Configuration

Vercel provides seamless deployment for React + Vite applications with automatic serverless function detection.

- Connect GitHub repository to Vercel
- Auto-detect Vite build configuration
- API routes in `/api` folder become serverless functions
- Environment variables configured in Project Settings

### 9.2 Handling Timeouts

**Challenge:** Vercel Hobby tier has 10-second function timeout. Research operations typically take 30-60 seconds.

**Solution:** Streaming responses keep the connection alive. The Vercel AI SDK handles chunked transfer encoding automatically, preventing timeout issues for most use cases.

**Fallback Option:** If timeouts persist, deploy the backend to Render.com (no strict timeouts on free tier) while keeping the frontend on Vercel.

---

## 10. Dependencies

### 10.1 Production Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-markdown": "^9.0.0",
    "@langchain/langgraph": "^0.2.0",
    "@langchain/openai": "^0.3.0",
    "@langchain/core": "^0.3.0",
    "@langchain/community": "^0.3.0",
    "duck-duck-scrape": "^2.2.0",
    "@vercel/postgres": "^0.10.0",
    "ai": "^3.0.0",
    "lucide-react": "^0.400.0"
  }
}
```

### 10.2 Development Dependencies

```json
{
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.2.0",
    "vite": "^5.0.0",
    "eslint": "^8.55.0"
  }
}
```

---

## 11. Success Criteria

### 11.1 Demo Requirements
- Complete research flow executes in under 60 seconds
- Real-time status updates display during processing
- Generated reports are coherent and well-structured
- Sources are properly cited with clickable links
- Report history persists across sessions

### 11.2 Technical Requirements
- Zero monthly operational cost (all free tiers)
- Responsive design works on mobile devices
- No authentication required for demo flow
- Graceful error handling with user-friendly messages

### 11.3 Interview Demonstration Points
- Explain LangGraph state machine architecture
- Discuss streaming implementation for serverless constraints
- Show how agent decides when to search more vs. write
- Highlight cost optimization through free tier selection

---

*— End of Document —*

*Generated: January 6, 2026*