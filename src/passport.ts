import passport from 'passport';
import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth2';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Request } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, 'config.env') });

// Serialize and Deserialize configurations
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
    done(null, user);
});

passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID as string,
        clientSecret: process.env.CLIENT_SECRET as string,
        callbackURL: `${process.env.BACKEND_URL}/api/v1/user/auth/google/callback`,
        passReqToCallback: true
    }, 
    // FIXED: Arguments are passed positionally, not as a single object!
    (req: Request, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) => {
        // You can save or update your user in the database here using the 'profile'
        return done(null, profile);
    }
));

export default passport;