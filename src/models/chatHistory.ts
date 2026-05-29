import mongoose, { InferSchemaType } from "mongoose";

const chatHistory = new mongoose.Schema({
    question:{
        type:String,
        required:[true,'Question is required']
    },
    answer:{
        type:String,
        required:[true,'Answer is required']
    },
    sources:{
        type:[String]
    },
    mode:{
        type: String,
        enum: ['web','direct'], 
        required:[true,'Mode is required']
    },
    createdAt:{
        type:Date,
        required:[true,'Created date is required']
    },
});

type ChatHistory = InferSchemaType<typeof chatHistory>;

export const Chat = mongoose.model<ChatHistory>("chat",chatHistory);