import { RunnableLambda } from "@langchain/core/runnables";


export function routeStartegy(q : string) : "web" | "direct" {
    const trimQuery  = q.toLowerCase().trim();

    const isLongQuery = trimQuery.length > 70;

    const recentYearsQuery  = /\b20(2[4-9]3[0-9])\b/.test(trimQuery);

    const patterns: RegExp[] = [
        /\btop[-\s]*\d+\b/u,
        /\bbest\b/u,
        /\brank(?:ing|ings)?\b/u,
        /\bwhich\s+is\s+better\b/u,
        /\b(?:vs\.?|versus)\b/u,
        /\bcompare|comparison\b/u,

        /\bprice|prices|pricing|cost|costs|cheapest|cheaper|affordable\b/u,
        /\bunder\s*\d+(?:\.\s*[kK])?\b/u,
        /\b\p{Sc}\s*\d+/u,

        /\blatest|today|now|current\b/u,
        /\bnews|breaking|trending\b/u,
        /\b(released?|launch|launched|announce|announced|update|updated)\b/u,
        /\bchangelog|release\s*notes?\b/u,

        /\bdeprecated|eol|end\s*of\s*life|sunset\b/u,
        /\broadmap\b/u,

        /\bworks\s+with|compatible\s+with|support(?:ed)?\s+on\b/u,
        /\binstall(ation)?\b/u,

        /\bnear\s+me|nearby\b/u,
    ];

    const isQueryPresentInPatterns = patterns.some(pattern =>pattern.test(trimQuery));

    if(isQueryPresentInPatterns || isLongQuery || recentYearsQuery){
        return 'web';
    }
    else{
        return 'direct';
    }
}

async function inputToRunnable(input : string){

    const q = input;

    const mode = routeStartegy(q);
    
    return {q,mode};

}

export const routerStep = RunnableLambda.from(inputToRunnable)
