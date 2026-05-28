import { runSearch } from '@/search_tool/searchChain';
import { searchInputSchema } from '@/utils/schemas';
import express from 'express';


export const searchRouter = express.Router();

searchRouter.post("/",async(req,res)=>{
    try{    
        const input = searchInputSchema.parse(req.body);
        const result = await runSearch(input);
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