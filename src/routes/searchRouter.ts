import { Chat } from '@/models/chatHistory';
import { User } from '@/models/user';
import { runSearch } from '@/search_tool/searchChain';
import { searchInputSchema } from '@/utils/schemas';
import express from 'express';


export const searchRouter = express.Router();

type USER = {
    email:string,
    id:string,
    iat:number,
    exp:number
}
searchRouter.post("/",async(req,res)=>{
    try{    
        const input = searchInputSchema.parse(req.body);
        const result = await runSearch(input);

        const user = req.user as USER

        await Chat.create({
            question:input.q,
            answer:result?.answer,
            sources:result?.sources,
            mode:result?.mode,
            createdAt:new Date(),
            userId:user.id,
            email:user.email
        })

        await User.findByIdAndUpdate(user.id, {
            $inc: {
                inputTokens: result?.inputTokens ?? 0,
                outputTokens: result?.outputTokens ?? 0
            }
        });
       
        res.status(200).json(result);
    }
    catch(err: any){
        console.log(err);
        res.status(400).json({
            error:"error",
            err
        })
    }
})