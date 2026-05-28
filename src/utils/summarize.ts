import { getChatModel } from "@/models";
import { summarizeInputSchema, summarizeOutputSchema } from "./schemas";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";


export async function summarize(text : string){
    const {text : raw} = summarizeInputSchema.parse({text});

    const clippedText = clip(raw,4000);

    const model = getChatModel({temperature:0.2});
    
    const response = await model.invoke([
        new SystemMessage([
            'You are a helpful assistant that writes short,accurate summaries',
            'Guidelines',
            'Be Factual and neutral and avoid any marketing language',
            '5-8 sentences,no lists unless absolutely necessary',
            'Do not invent sources, you only need to summarize the provided text',
            'Keep it readable for beginners'
        ].join("\n")),
        new HumanMessage([
            "Summarize the following content for a beginner friendly audience",
            "Focus on key facts and remove fluff",
            "Text :",
            clippedText
        ].join("\n"))
    ]);

    const rawModelOutput = typeof response.content  === 'string' ? 
    response.content : String(response.content);

    const summary = normalizeSummary(rawModelOutput);

    return summarizeOutputSchema.parse({
        summary
    });

}

function normalizeSummary(s:string){
    const regex = s
    .replace(/\s+\n/g,"\n")
    .replace(/\n{3,}/g,"\n")
    .trim();

    return regex.slice(0,2500);
}

function clip(text:string,maxLimit:number){
    return text.length > maxLimit ? text.slice(0,maxLimit) : text;
}