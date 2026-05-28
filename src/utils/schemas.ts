// Legal contract between backend - AI models - frontend
// If schema fails response doesnot hit endpoint
import {z} from 'zod';

const WebSearchResultSchema = z.object({
    title:z.string().min(1),
    url:z.url(),
    snippet:z.string().optional().default("")
});

export const WebSearchResultsSchema = z.array(WebSearchResultSchema);

export type WebSearchResult = z.infer<typeof WebSearchResultSchema>;

export const openUrlInputSchema = z.object({
    url:z.url()
})

export const openUrlOutputSchema = z.object({
    url:z.url(),
    content:z.string().min(1)
});

export const summarizeInputSchema = z.object({
    text : z.string().min(50,'Need bit more text to summarize')
});

export const summarizeOutputSchema = z.object({
    summary : z.string().min(1)
});

export const searchInputSchema = z.object({
    q : z.string().min(5,"Please be  specific")
});

export type SearchInput = z.infer<typeof searchInputSchema>;

export const SearchAnswerSchema = z.object({
    answer : z.string(),
    sources : z.array(z.url()).default([]),
    mode: z.enum(['web','direct'])
});

export type SearchAnswer = z.infer<typeof SearchAnswerSchema>; 




