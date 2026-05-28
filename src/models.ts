import {env} from './shared/env';
import {ChatOpenAI} from '@langchain/openai';
import {ChatGoogle} from '@langchain/google';
import {ChatGroq} from '@langchain/groq';
import type {BaseChatModel} from '@langchain/core/language_models/chat_models';


type ModelOptions = {
    temperature?:number,
    maxTokens?:number
}

export function getChatModel(options : ModelOptions={}):BaseChatModel{
    const temp = options.temperature ?? 0.2;

    switch(env.MODEL_PROVIDER){
        case 'gemini':
            return new ChatGoogle({
                apiKey:env.GOOGLE_API_KEY,
                model:env.GOOGLE_MODEL,
                temperature:temp
            })
        case 'openai':
            return new ChatOpenAI({
                apiKey:env.OPENAI_API_KEY,
                model:env.OPENAI_MODEL,
                temperature:temp
            })
        case 'groq':
            return new ChatGroq({
                apiKey:env.GROQ_API_KEY,
                model:env.GROQ_MODEL,
                temperature:temp,
            })  
        
        default:
            return new ChatOpenAI({
                apiKey:env.OPENAI_API_KEY,
                model:env.OPENAI_MODEL,
                temperature:temp
            })    
    }
}