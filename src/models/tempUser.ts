import mongoose, { InferSchemaType } from "mongoose";
import validator from "validator";

const tempUser = new mongoose.Schema({
    firstName:{
        type:String,
        required:[true,"First Name not Provided"]
    },
    lastName:{
        type:String,
        required:[true,"Last Name not Provided"]
    },
    email:{
        type:String,
        unique:[true,"Email already exists"],
        required:[true,"Email not Provided"],
        validate:[validator.isEmail,"Email is not valid"]
    },
    code:{
        type:String,
        required:[true,"Need an Code"]
    },
    expiresIn:{
        type:Date
    }
})

type TempUser = InferSchemaType<typeof tempUser>;

export const TempUser = mongoose.model<TempUser>("tempUser",tempUser)

