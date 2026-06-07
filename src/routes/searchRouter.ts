import { Chat } from '@/models/chatHistory';
import { User } from '@/models/user';
import { runSearch } from '@/search_tool/searchChain';
import { searchInputSchema } from '@/utils/schemas';
import express from 'express';


export const searchRouter = express.Router();


searchRouter.post("/",async(req,res)=>{
    try{    
        const {q, id, email} = searchInputSchema.parse(req.body);
        const result = await runSearch({ q, id, email });

        await Chat.create({
            question:q,
            answer:result?.answer,
            sources:result?.sources,
            mode:result?.mode,
            createdAt:new Date(),
            userId:id,
            email:email
        })

        await User.findByIdAndUpdate(id, {
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