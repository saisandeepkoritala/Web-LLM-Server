import { RunnableLambda } from "@langchain/core/runnables";
import { Candidate } from './types';
import { SearchAnswerSchema } from "@/utils/schemas";
import { getChatModel } from "@/models";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

async function inputToRunnable(candidate : Candidate){

    const finalDraft = {
        answer : candidate.answer,
        sources : candidate.sources ?? [],
        mode :  candidate.mode
    }

    const parsed1 = SearchAnswerSchema.safeParse(finalDraft);
    if(parsed1.success) return parsed1.data

    // one shot repair
    const repair = await repairSearchAnswer(finalDraft);

    const parsed2 = SearchAnswerSchema.safeParse(repair);

    if(parsed2.success) return parsed2.data
    
}

async function repairSearchAnswer(obj:any) : Promise<{answer:string;sources:string[];mode:'web'|'direct'}>{
    const model = getChatModel({temperature:0.2});

    const response = await model.invoke([
        new SystemMessage(
            [
                "You need to fix the json object to match the given schema",
                "Respond only with valid json object",
                "Schema : {answer:string;sources:string[] (urls as strings)}"
            ].join("\n")
        ),
        new HumanMessage(
            [
                "Make this exactly to the schema. Ensure sources is an array of URL strings",
                "Input JSON",
                JSON.stringify(obj)
            ].join("\n")
        )
    ]);

    const text = typeof (response.content)==="string"? response.content:String(response.content);

    const json = extractJSON(text);

    return {
        answer:String(json?.answer ?? "").trim(),
        sources : Array.isArray(json?.sources) ? json?.sources?.map(String) : [],
        mode : Array.isArray(json?.sources) ? 'web' : 'direct',
    }
}

function extractJSON(s:string){
    const start = s.indexOf("{");
    const end = s.indexOf("}");

    if(start===-1 || end===-1 || end<=start) return {}

    try{
        return JSON.parse(s.slice(start,end+1))
    }

    catch(err){
        return {error:"Error in one shot"}
    }
}


export const finalValidateAndPolish = RunnableLambda.from(inputToRunnable)