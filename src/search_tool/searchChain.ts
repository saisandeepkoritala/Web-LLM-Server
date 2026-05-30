import { RunnableBranch, RunnableSequence } from "@langchain/core/runnables";
import { webPath } from "./webPipeline";
import { directPath } from "./directPipeline";
import { routerStep } from "./routeStartegy";
import { finalValidateAndPolishStep } from "./finalValidate";
import { SearchInput } from "@/utils/schemas";

type OutputSchema = {
    answer: string,
    sources:string[],
    mode:'direct'|'web',
    inputTokens:number,
    outputTokens:number
} 

type InputSchema = {
    q:string;
    mode:'direct'|'web'
}

const branchStep = RunnableBranch.from<InputSchema, OutputSchema>(
    [
        [(input)=>input.mode==='web', webPath],
        directPath
    ]
)

export const searchChain = RunnableSequence.from([
    routerStep,
    branchStep,
    finalValidateAndPolishStep
])

export async function runSearch(input:SearchInput){
    return await searchChain.invoke(input.q);
}