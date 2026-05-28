import {env} from '../shared/env';
import { WebSearchResultsSchema } from './schemas';

export async function webSearch(q:any){
    const query = (q??"").trim()

    if(!query) return []

    return await searchTavilyUtil(query);
}

async function searchTavilyUtil(query: string) {
    if (!env.SEARCH_API_KEY) throw new Error('Search Api Key error');

    const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Note: Tavily typically expects the API key in the JSON body 
            // under the "api_key" property rather than an Authorization header,
            // but if this endpoint accepts Bearer tokens for your setup, leave it!
        },
        body: JSON.stringify({
            api_key: env.SEARCH_API_KEY, // Kept here just in case Tavily requires it in the body
            query,
            search_depth: 'basic',
            max_results: 5,
            include_answer: false,
            include_images: false,
        })
    });

    if (!response.ok) {
        const text = await safeText(response);
        throw new Error(`Response from tavily error ${text}`);
    }

    const data = await response.json();
    const results = Array.isArray(data?.results) ? data.results : [];

    // 💡 Fix 1: Added explicit 'return' inside the map statement
    const normalized = results.slice(0, 5).map((result: any) => {
        return {
            title: String(result?.title ?? "").trim() || 'Untitled',
            url: String(result?.url ?? "").trim(),
            snippet: String(result?.snippet ?? "").trim().slice(0, 220) || 'No description available',
        };
    });

    // 💡 Fix 2: Validates the entire array cleanly
    return WebSearchResultsSchema.parse(normalized);
}

async function safeText(response:Response){  
    try{
        return await response.text();
    }
    catch{
        return '<no response body>';
    }
}