import { openUrl } from "@/utils/openUrl";
import { summarize } from "@/utils/summarize";
import { webSearch } from "@/utils/websearch";
import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { Candidate } from "./types";
import { getChatModel } from "@/models";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const setTopResults = 5;

type Input1 = {
    q : string; 
    mode : 'web' | 'direct'
}

async function inputToRunnable1(input : Input1){
    const results = await webSearch(input.q);

    return {
        ...input,
        results
    };
}

export const webSearchStep = RunnableLambda.from(inputToRunnable1);


type Input2 = {
    q : string; 
    mode : 'web'|'direct'; 
    results : any
}

async function inputToRunnable2(input:Input2){

    if(!Array.isArray(input.results) || input.results.length===0){
        return {
            ...input,
            pageSummaries:[],
            fallback:'no-results' as const
        };
    }
    
    const extractTopResults = input.results.slice(0,setTopResults);

    const k = extractTopResults.map(async (result : any )=>{
        const opened = await openUrl(result.url);
        const summarizeContent = await summarize(opened.content);

        return {
            url:opened.url,
            summary:summarizeContent.summary
        }
    });

    const settledResults= await Promise.allSettled(k);

    const settledResultsPageSummarizes1 = settledResults.filter(s=>s.status==="fulfilled");

    const settledResultsPageSummarizes2 = settledResultsPageSummarizes1.map(s=>s.value);

    if(settledResultsPageSummarizes2.length===0){
        const fallbackSnippetSummaries = extractTopResults.map((s:any)=>({
            url:s.url,
            summary:String(s.snippet || s.title || "").trim(),
        })).filter(x=>x.summary.length>0);

        return {
            ...input,
            pageSummaries:fallbackSnippetSummaries,
            fallback : 'snippets' as const
        }
    }

    return {
        ...input,
        pageSummaries : settledResultsPageSummarizes2,
        fallback : 'none' as const
    }
}

export const openAndSummarizeStep = RunnableLambda.from(inputToRunnable2);



type Input3 = {
    q : string ; 
    mode : 'web' | 'direct',
    pageSummaries : Array<{url : string, summary : string}>;
    fallback:'no-results' |  'snippets' | 'none'
}

async function inputToRunnable3(input : Input3 ):Promise<Candidate>{

    const model = getChatModel({temperature:0.2});

    if(!input.pageSummaries || input.pageSummaries.length===0){
        const directAnsFromModel = await model.invoke([
            new SystemMessage([
                "You answer briefly and clearly for beginners",
                "If unsure, say so"
            ].join("\n")),
            new HumanMessage(input.q)
        ]);

        const directAns = typeof (directAnsFromModel.content) ==='string' ? 
        directAnsFromModel.content : String(directAnsFromModel.content);

        return {
            answer: directAns.trim(),
            sources:[],
            mode:'direct'
        }
    }

    const response = await model.invoke(
        [
            new SystemMessage(
                [
                    'You concisely answer questions using provided page summaries',
                    'Rules :',
                    'Be accurate and neutral',
                    '5-8 sentences max',
                    'Use only provided summaries, do not invent new facts'
                ].join("\n")
            ),
            new HumanMessage(
                [
                    `Question : ${input.q}`,
                    `Summarize the below`,
                    JSON.stringify(input.pageSummaries,null,2)
                ].join("\n")
            )
        ]
    );

    const finalAnswer = typeof (response.content) === 'string' ? 
    response.content : String(response.content);

    return {
            answer: finalAnswer,
            sources:input.pageSummaries.map(s=>s.url),
            mode:'web'
        }
}

export const stepCompose = RunnableLambda.from(inputToRunnable3);





export const webPath = RunnableSequence.from(
    [
    webSearchStep,
    openAndSummarizeStep,
    stepCompose
    ]
);



