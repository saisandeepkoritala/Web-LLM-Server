import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import passport from './passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { searchRouter } from './routes/searchRouter';
import { authRouter } from './routes/authRouter';
import { historyRouter } from './routes/historyRouter';
import { checkJwtToken } from './middlewares/checkJwtToken';

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Core Middleware
app.use(cors({ 
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,                
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization"], 
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

// 2. Initialize Passport Middleware (Crucial for your Google OAuth setup)
app.use(passport.initialize());
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV ==='production'?true:false } 
    // Set to true if using HTTPS
}));


// 3. API Routes
app.use("/api/v1/fetchUserHistory",historyRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/user/auth",authRouter);


// 4. Safe Database Connection String Construction
const dbConnectionString = process.env.DATABASE;
const dbPassword = process.env.PASSWORD;

if (!dbConnectionString || !dbPassword) {
    console.error("FATAL ERROR: DATABASE or PASSWORD environmental variables are missing.");
    process.exit(1); 
}

const DB = dbConnectionString.replace("<PASSWORD>", dbPassword);

// 5. Connect to MongoDB
mongoose.connect(DB)
  .then(() => console.log("Connection is Successful to DB"))
  .catch((err: unknown) => console.error("Error in connecting to DB:", err));

// 6. Start Server
app.listen(PORT, () => {
    console.log(`Server is running securely on port ${PORT}`);
});