import {Send} from '../utils/email';
import jwt from 'jsonwebtoken';
import {User} from '../models/user';
import {TempUser} from '../models/tempUser';
import {env} from '../shared/env';
import { NextFunction, Request, Response } from 'express';

export const getToken = (email : string) => {
    return jwt.sign({ email }, env.JWT_SECRET, { expiresIn: '1d' });
};

export const googleAuthCallback = async (req:Request, res:Response) => {
    try {
        const token = getToken(req.user.email) as string;
        let user = await User.findOne({ email: req.user.email });

        if (user) {
            if (!user.accountType.includes("google")) {
                user.accountType.push("google");
                user.picture = req.user.picture || req.user.photos[0]?.value;
                await user.save({ validateBeforeSave: false });
            }
        } else {
            user = new User({
                userName: req.user.displayName,
                email: req.user.email,
                accountType: ["google"],
                picture: req.user.picture || req.user.photos[0]?.value,
                accountCreatedAt: new Date(),
            });
            await user.save({ validateBeforeSave: false });
        }

        const userData = encodeURIComponent(JSON.stringify(user));

        res.cookie("Access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "Lax",
            path: "/"
        });

        const frontendURL = process.env.FRONTEND_URL.endsWith('/') 
            ? process.env.FRONTEND_URL.slice(0, -1) 
            : process.env.FRONTEND_URL;
        res.redirect(`${frontendURL}/login?userData=${userData}`);
    } catch (error) {
        console.error("Auth Error ra unga:", error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
};

export const isAlive = (req:Request, res:Response) => {
    res.status(200).json({ message: "Server is alive!" });
};

export const verifyToken = (token : string) => {
    try {
        return jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
        return null; 
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // 1. Find the user and explicitly handle the case where they don't exist
        const user = await User.findOne({ email, accountType: "normal" }).select("+password");
        
        if (!user) {
            res.status(401).json({
                status: "Fail",
                message: "Incorrect email or password",
            });
            return; 
        }

        // 2. Safely check the password now that we know 'user' exists
        const isPasswordCorrect = await user.correctPassword(password, user.password);

        if (!isPasswordCorrect) {
            res.status(401).json({
                status: "Fail",
                message: "Incorrect email or password",
            });
            return;
        }

        // 3. Generate token and strip password from response object
        const token = getToken(user.email);
        
        const userResponse = user.toObject();

        // Destructure password out, rest contains everything else
        const { password: _, ...cleanUser } = userResponse;

        // 4. Send cookie and response
        res.cookie("Access_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
        })
        .status(200)
        .json({
            status: "success",
            token,
            data: {
                user: cleanUser,
            },
        });

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred";
        
        res.status(500).json({
            status: "Fail",
            error: "error",
            message: errorMessage
        });
    }
};

export const signUp = async (req:Request, res:Response) => {
    try {
        // Validate password confirmation
        if (req.body.password !== req.body.passwordConfirm) {
            return res.status(400).json({
                status: 'Fail',
                error: 'Passwords do not match'
            });
        }

        // Check for existing user
        const isAlreadyUser = await User.findOne({ email: req.body.email });
        let newUser;

        // Handle different account types
        if (isAlreadyUser?.accountType?.includes("google")) {
            // User has a Google account and needs to add a normal account

            isAlreadyUser.accountType.push("normal");
            isAlreadyUser.password = req.body.password;
            isAlreadyUser.passwordConfirm = req.body.passwordConfirm;

            await isAlreadyUser.save({ validateBeforeSave: false });
            newUser = isAlreadyUser;
        } else {
            // User does not have a Google account and needs to add a normal account
            newUser = new User({
                userName: req.body.name,
                email: req.body.email,
                password: req.body.password,
                passwordConfirm: req.body.passwordConfirm,
                accountType: ["normal"],
                accountCreatedAt: new Date(),
                passwordLastRestedAt: new Date(),
                passwordLastUpdatedAt: new Date(),
            });
            await newUser.save();
        }


        // Generate and send token
        const token = getToken(newUser.email);
        await TempUser.deleteOne({ email: newUser.email });

        res.cookie("Access_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
        })
        .status(200)
        .json({
            status: "success",
            token,
            data: {
                user: newUser,
            },
        });

    } catch (e:any) {
        console.error("Error during sign up:", e);
        res.status(500).json({
            status: "Fail",
            error: e.message || "Internal Server Error",
        });
    }
};

export const sendCode = async (req:Request, res:Response) => {
    try {
        const { name, email } = req.body;

        // 1. Check if user already exists
        const duplicate = await User.findOne({
            email: email,
            accountType: { $in: ["normal"] }
        });

        if (duplicate) {
            return res.status(401).json({
                status: "Fail",
                message: "Email already exists"
            });
        }

        // 2. Generate OTP and Expiry
        const otpCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // 3. Send Email first
        await Send({
            email: email,
            subject: "Your Verification Code",
            message: `Your code is ${otpCode}. It expires in 10 minutes.`
        });

        // 4. Update or Create TempUser record
        await TempUser.findOneAndUpdate(
            { email: email },
            { userName: name, code: otpCode, expiresIn: expiresAt },
            { upsert: true, new: true }
        );

        // 5. Send ONE final response
        res.status(200).json({
            status: "success",
            message: "Code sent successfully"
        });

    } catch (e: any) {
        console.error("Error in sendCode:", e);
        res.status(500).json({
            status: "Fail",
            message: "Failed to send code. Please try again.",
            error: e.message
        });
    }
};

export const secureRoute=async(req:Request, res:Response,next:NextFunction)=>{
    
    const token = req.cookies.Access_token;
    console.log("token in secure route :",token)

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, env.JWT_SECRET, (err : any, decoded : any) => {
        if (err) {
        return res.status(401).json({ message: 'Token is not valid' });
        }
        req.user = decoded;
        // decoded contain user email
        next();
    });
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, passwordConfirm } = req.body;

        const isUser = await User.findOne({ email }).select("+password");

        if (!isUser) {
            res.status(400).json({
                status: "fail",
                message: "invalid details"
            });
            return; 
        }

        const isPasswordCorrect = await isUser.correctPassword(password, isUser.password);

        if (!isPasswordCorrect) {
            res.status(401).json({ 
                status: "fail",
                message: "password different"
            });
            return;
        }

        isUser.password = password;
        isUser.passwordConfirm = passwordConfirm;
        isUser.passwordLastUpdatedAt = new Date();
        isUser.passwordLastRestedAt = new Date();

        await isUser.save({ validateBeforeSave: false });

        res.status(200).json({
            status: "success",
            message: "Password updated successfully"
        });

    } catch (e) {
        
        const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred";
        
        res.status(500).json({
            status: "fail",
            message: errorMessage
        });
    }
};


export const modifyPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            res.status(404).json({
                status: "fail",
                message: "User not found"
            });
            return;
        }
        if (!password || password.trim().length < 8) {
            res.status(400).json({
                status: "fail",
                message: "Password must be at least 8 characters long"
            });
            return;
        }

        user.password = password;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: "success",
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "An error occurred while updating password"
        });
    }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        
        const { email } = req.body;

        const isEmailValid = await User.findOne({ email, accountType: { $in: ["normal"] } });

        if (!isEmailValid) {
            res.status(400).json({
                status: "error",
                message: "No account present"
            });
            return; 
        }

        // Generate a 6-digit random token string
        const message = Math.floor(100000 + Math.random() * 900000).toString();
        isEmailValid.passwordResetToken = message;
        isEmailValid.passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); 
        
        await isEmailValid.save({ validateBeforeSave: false });

        
        try {
            const resp = await Send({
                email: `${email}`,
                subject: "Forgot Password",
                message: `${message}`
            });

            res.status(200).json({
                status: "success",
                message: "code sent, sending reset token to email",
                resp
            });
        } catch (error) {
            res.status(400).json({
                status: "Fail",
                message: "For some Reason email Failed",
                error: error instanceof Error ? error.message : error
            });
        }

    } catch (e) {
        res.status(500).json({ 
            status: "Fail catch",
            message: "An internal server error occurred"
        });
    }
};

export const verifyForgotOtp = async (req:Request, res:Response) => {
    try {
        
        const user = await User.findOne({ email: req.body.email, passwordToken: req.body.otp});
        
        if (!user) {
            return res.status(422).json({
                status: "OTP Incorrect",
                message: "Wrong OTP"
            });
        } else {
            return res.json({
                status: "success",
                message: "OTP verification successful"
            });
        }
    } catch (error : any) {
        
        return res.status(500).json({
            status: "Failed to verify OTP",
            message: "Failed to verify OTP. Please try again.",
            error: error.message
        });
    }
};

export const logOut = async(req:Request, res:Response)=>{
    try{
        res.clearCookie('Access_token').status(200).json({
            status:"ok"
        });
    }
    catch(e : any){
        return res.status(500).json({
            status: "error",
            message: "Please try again.",
            error: e.message
        });
        
    }
};

export const verifyCode=async(req:Request, res:Response)=>{
    try{
        const {email,code} = req.body;

        const tempuser = await TempUser.findOne({
            email:email,
            code:code,
            expiresIn: { $gt: new Date() }
        })
        if(tempuser){
            res.status(200).json({
                status:"success",
                message:"verified"
            })
        }
        else{
            res.status(401).json({
                status:"Fail",
                message:"OTP expired"
            })
            return;
        }
    }
    catch(e : any){
        return res.status(500).json({
            status: "error",
            message: "Please try again.",
            error: e.message
        });
    }
};

export const profilePic=async(req:Request, res:Response)=>{
    try{
        const user = await User.findOne({email:req.body.email});

        if(!user){
            res.status(404).json({
                status:"fail",
                message:"user pic not found"
            })
            return;
        }
        else{
            return res.status(200).json({
                status:"success",
                pic:user.picture
            })
        }
    }
    catch(e : any){
        return res.status(500).json({
            status: "error",
            message: "Please try again.",
            error: e.message
        });
    }
};