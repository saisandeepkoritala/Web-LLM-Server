import { Router, Response,Request } from 'express';
import { Chat } from '@/models/chatHistory'; 
import express from 'express';

export const historyRouter = express.Router();


historyRouter.post("/", async (req: Request, res: Response) => {
    try {
        const user = req.body; 
        if (!user || !user.id) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const history = await Chat.find({ 
            userId: user.id, 
            email: user.email 
        })
        .sort({ createdAt: -1 })
        .select("question answer sources mode -_id");

        return res.status(200).json(history);
    }

    catch (e: any) {
        console.error("Failed to fetch chat history:", e);
        return res.status(500).json({ 
            error: "Internal Server Error", 
            message: e.message 
        });
    }
});