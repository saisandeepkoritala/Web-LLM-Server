import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request interface to include a user property
export interface AuthenticatedRequest extends Request {
    user?: any; // You can replace 'any' with a specific User interface/type
}

export const checkJwtToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // 1. Get the Authorization header
        const authHeader = req.cookies.Access_token;
        console.log(authHeader)

        // 2. Check if the header exists and follows the 'Bearer <token>' format
        if (!authHeader) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        // 3. Extract the actual token string
        const token = authHeader

        // 4. Verify the token using your JWT Secret
        const secretKey = process.env.JWT_SECRET || "your_fallback_secret_key";
        const decoded = jwt.verify(token, secretKey);

        // 5. Attach the decoded payload to the request object
        req.user = decoded;
        // 6. Everything is valid! Move to the next route handler
        next();
    } catch (err) {
        // If jwt.verify throws an error (expired token, altered token, etc.)
        console.error("JWT Verification failed:", err);
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};