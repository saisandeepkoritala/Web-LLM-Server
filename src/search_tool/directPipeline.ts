import { RunnableLambda } from "@langchain/core/runnables";
import { Candidate } from "./types";
import { getChatModel } from "@/models";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

type Input = {
    q:string, 
    mode:'web'|'direct'
}

async function inputToRunnable(input : Input):Promise<Candidate>{
    const model = getChatModel({temperature:0.2});

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
            inputTokens:directAnsFromModel.usage_metadata?.input_tokens || 0,
            outputTokens:directAnsFromModel.usage_metadata?.output_tokens || 0,
            sources:[],
            mode:'direct'
        }
}

export const directPath = RunnableLambda.from(inputToRunnable);



