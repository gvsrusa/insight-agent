import { Tool } from "@langchain/core/tools";

interface TavilySearchResponse {
    results: {
        title: string;
        url: string;
        content: string;
        score: number;
    }[];
}

export class TavilySearchTool extends Tool {
    name = "tavily_search";
    description = "A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events. Input should be a search query.";

    private apiKey: string;
    private maxResults: number;

    constructor(fields?: { apiKey?: string; maxResults?: number }) {
        super();
        this.apiKey = fields?.apiKey || process.env.TAVILY_API_KEY || "";
        this.maxResults = fields?.maxResults || 5;

        if (!this.apiKey) {
            throw new Error("Tavily API key not found");
        }
    }

    async _call(input: string): Promise<string> {
        try {
            const response = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    api_key: this.apiKey,
                    query: input,
                    max_results: this.maxResults,
                }),
            });

            if (!response.ok) {
                throw new Error(`Tavily API error: ${response.statusText}`);
            }

            const data = (await response.json()) as TavilySearchResponse;

            // Format results for the agent
            return JSON.stringify(data.results.map(r => ({
                title: r.title,
                url: r.url,
                content: r.content
            })));
        } catch (error) {
            console.error("Tavily search error:", error);
            return "Error performing search.";
        }
    }
}
