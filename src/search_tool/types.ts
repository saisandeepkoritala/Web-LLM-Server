export type Candidate = {
    answer : string,
    sources : string[],
    mode : 'web' | 'direct',
    inputTokens : number,
    outputTokens : number
};

