import 'dotenv/config';
import cors from 'cors';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import passport from './passport';
import { searchRouter } from './routes/searchRouter';
import { authRouter } from './routes/authRouter';

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Core Middleware
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));
app.use(express.json());
app.use(morgan('dev'));

// 2. Initialize Passport Middleware (Crucial for your Google OAuth setup)
app.use(passport.initialize());

// 3. API Routes
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/user", authRouter);


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