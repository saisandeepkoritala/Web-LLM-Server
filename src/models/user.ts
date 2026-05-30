import mongoose, { Document, InferSchemaType } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Last Name is needed for user"], 
  },
  email: {
    type: String,
    unique: true, 
    validate: [validator.isEmail, "Email is not valid"],
    required: [true, "Email is Needed"],
  },
  password: {
    type: String,
    required: [true, "Password is needed for user"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Password is needed for user"],
    minlength: 8,
    validate: {
      validator: function (this: any, value: string): boolean {
        return this.password === value;
      },
      message: "Password Not Matched",
    },
  },
  accountType: {
    type: [String], 
    required: [true, "Account Type is needed for user"],
  },
  picture: {
    type: String,
  },
  accountCreatedAt: {
    type: Date,
    default: Date.now,
  },
  passwordLastRestedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetTokenExpires: {
    type: Date,
  },
  passwordLastUpdatedAt: {
    type: Date,
  },
  inputTokens:{
    type:Number,
    default:0,
  },
  outputTokens:{
    type:Number,
    default:0
  },
  totalCalls:{
    type:Number
  },
  reachedMaxLimit:{
    type : Boolean,
    default:false,
  }
});

type User = InferSchemaType<typeof userSchema>;

interface UserMethods {
  correctPassword(password: string, userPassword: string): Promise<boolean>;
}

// FIX 1: Pure Async/Await Password Hashing (Removed 'next')
userSchema.pre<User & Document>('save', async function () {
  if (!this.isModified("password")) {
    return;
  }
  
  this.password = await bcrypt.hash(this.password as string, 12);
  (this as any).passwordConfirm = undefined; 
});

// FIX 2: Pure Async/Await Token Validation (Removed 'next', throwing native errors)
userSchema.pre<User & Document>('save', async function () {
  if (this.inputTokens >= 1000000) {
    this.reachedMaxLimit = true;
    
    throw new Error("TokenLimitExceeded: User has run out of tokens.");
  }
});

userSchema.methods.correctPassword = async function (
  password: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, userPassword);
};

export const User = mongoose.model<User, mongoose.Model<User, {}, UserMethods>>("user", userSchema);