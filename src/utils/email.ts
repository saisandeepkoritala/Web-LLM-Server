import { Resend } from 'resend';
import { Request, Response } from 'express';

// Initialize Resend with your environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

type Body = {
    email: string;
    subject: string;
    message: string;
}

// 1. New HTTP-Based Send Function
export const Send = async ({ email, subject, message }: Body): Promise<string> => {
    console.log("Sending email via Resend HTTP API to:", email);

    try {
        await resend.emails.send({
            // NOTE: On the free tier without a custom domain, 
            // you MUST send 'from' this exact address:
            from: 'onboarding@resend.dev', 
            to: email,
            subject: subject,
            html: `
                <div style="background-color: #f4f4f4; padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="color: #333;">${subject}</h2>
                    <p style="font-size: 16px; color: #0000FF;">${message}</p>
                    <p style="font-size: 14px; color: #777;">Thanks for using our service!</p>
                </div>
            `
        });
        
        console.log("Email sent successfully via Resend!");
        return "success";
    } catch (err: any) {
        console.error("Resend API encountered an error:", err.message);
        throw new Error("Email delivery failed");
    }
};