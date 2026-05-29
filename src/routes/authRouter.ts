import express from 'express';
import passport from 'passport';
import { googleAuthCallback,isAlive,loginUser,
    signUp,sendCode,verifyCode,verifyForgotOtp,
    updatePassword,modifyPassword,
    forgotPassword,logOut } from '../controllers/authController';


export const authRouter = express.Router();

authRouter.get('/google', passport.authenticate('google', { 
    scope: ['email', 'profile'] 
}));

authRouter.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    googleAuthCallback
);

authRouter.get('/isAlive', isAlive);
authRouter.post('/login', loginUser);       
authRouter.post('/signup', signUp);
authRouter.post('/sendCode', sendCode);
authRouter.post('/verifyCode', verifyCode);
authRouter.post('/verifyForgotOtp', verifyForgotOtp);
authRouter.post('/updatePassword', updatePassword);
authRouter.post('/modify-password', modifyPassword);
authRouter.post('/forgotPassword', forgotPassword);
authRouter.post('/logout', logOut);

