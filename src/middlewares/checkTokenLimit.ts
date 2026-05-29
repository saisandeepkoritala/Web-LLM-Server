import { Request, Response, NextFunction } from "express";
import { User } from "../models/user"; 

export const checkTokenLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get the authenticated user (assuming you attach user to req in an auth middleware)
    const userId = (req as any).user?._id; 
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const user = await User.findById(userId);

    // 2. Check if they have broken the limit or are explicitly flagged
    if (!user || user.inputTokens >= 1000000 || user.reachedMaxLimit) {
      
      if (user && !user.reachedMaxLimit) {
        user.reachedMaxLimit = true;
        await user.save();
      }

      return res.status(429).json({ 
        status: "fail",
        message: "You have exhausted your available input tokens. Request denied." 
      });
    }

    // 3. Everything is fine, proceed to the controller
    next();
  } catch (error) {
    res.status(500).json({ message: "Server validation error", error });
  }
};