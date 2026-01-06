import { StateGraph, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { TavilySearchTool } from "./TavilyTool";
import type { ResearchState } from "./state";

// Initialize the model (OpenRouter)
const openRouterKey = process.env.OPENROUTER_API_KEY;
if (!openRouterKey) console.warn("OPENROUTER_API_KEY missing");

const model = new ChatOpenAI({
    modelName: "meta-llama/llama-3.3-70b-instruct:free",
    apiKey: openRouterKey, // trying 'apiKey' alias
    configuration: {
        baseURL: "https://openrouter.ai/api/v1",
    },
    temperature: 0,
});

// Initialize Tools
const searchTool = new TavilySearchTool({
    maxResults: 5,
    apiKey: process.env.TAVILY_API_KEY,
});

// --- Nodes ---

async function researchNode(state: ResearchState): Promise<Partial<ResearchState>> {
    const { topic, logs } = state;
    const newLogs = [...(logs || []), `Searching for: ${topic}...`];

    try {
        const searchResult = await searchTool.invoke(topic);
        // Parse result if it's a string, otherwise use JSON.stringify
        const content = typeof searchResult === 'string' ? searchResult : JSON.stringify(searchResult);

        return {
            searchResults: [content],
            logs: [...newLogs, "Search complete. Analyze results..."]
        };
    } catch (error) {
        return {
            searchResults: [],
            logs: [...newLogs, `Search failed: ${error}`]
        };
    }
}

async function writeNode(state: ResearchState): Promise<Partial<ResearchState>> {
    const { topic, searchResults, logs } = state;
    const newLogs = [...(logs || []), "Generating report..."];

    const content = searchResults.join("\n\n");

    const prompt = `
  You are an expert researcher.
  Topic: ${topic}
  
  Information:
  ${content}
  
  Write a comprehensive, well-structured markdown report on the topic based on the provided information.
  Include citations where possible.
  `;

    const response = await model.invoke([
        new SystemMessage("You are a helpful and rigorous research assistant."),
        new HumanMessage(prompt)
    ]);

    return {
        report: response.content as string,
        logs: [...newLogs, "Report generated."]
    };
}

// --- Graph Definition ---

const graph = new StateGraph<ResearchState>({
    channels: {
        topic: {
            reducer: (x: string, y: string) => y ? y : x,
            default: () => ""
        },
        searchResults: {
            reducer: (x: string[], y: string[]) => x.concat(y),
            default: () => []
        },
        report: {
            reducer: (x: string, y: string) => y ? y : x,
            default: () => ""
        },
        logs: {
            reducer: (x: string[], y: string[]) => x.concat(y),
            default: () => []
        }
    }
})
    .addNode("research", researchNode)
    .addNode("write", writeNode)
    .addEdge("__start__", "research")
    .addEdge("research", "write")
    .addEdge("write", END);

export const agent = graph.compile();
