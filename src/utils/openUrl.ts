import {convert} from 'html-to-text';
import { openUrlOutputSchema } from './schemas';

export async function openUrl(url :  string){

    const normalizedUrl = validateUrl(url);

    const response = await fetch(normalizedUrl,{
        headers:{
            'User-Agent':'agent-core/1.0 (+course-demo)'
        }
    });

    if(!response.ok){
        const text = await safeText(response);
        throw new Error(`OpenUrl error ${text}`);
    }

    const contentType = response.headers.get('content-type') ?? "";
    const raw = await response.text();

    const text = contentType.includes('text/html') ?
    convert(raw,{
        wordwrap:false,
        selectors:[
            {
                selector:'nav',format:'skip'
            },
            {
                selector:'header',format:'skip'
            },
            {
                selector:'footer',format:'skip'
            },
            {
                selector:'script',format:'skip'
            },
            {
                selector:'style',format:'skip'
            },
        ]
    }) : raw  
    console.log(text);
    console.log("---------------------------------------")
    console.log(text.length);
    console.log("------------------------------------------")
    const cleanedText = collapseWhiteSpace(text);
    console.log(cleanedText)
    const cappedText = cleanedText.slice(0,8000);

    return openUrlOutputSchema.parse({
        url:normalizedUrl,
        content:cappedText
    })

}

function collapseWhiteSpace(s:string){
    return s.replace(/\s+/g,"").trim()
}

async function safeText(response:Response){  
    try{
        return await response.text();
    }
    catch{
        return '<no response body>';
    }
}

function validateUrl(url:string){
    try{
        const parsedUrl = new URL(url);
        if(!/^https?:$/.test(parsedUrl.protocol)){
            throw new Error('Only http or https are allowed');
        }
        return parsedUrl.toString();
    }
    catch(err){
        throw new Error('Invalid url')
    }
}