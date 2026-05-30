import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        // This prevents Render's cloud IP from being instantly rejected
        rejectUnauthorized: false 
    }
});

type Body = {
    email : string,
    subject : string,
    message : string
}

// Send an email
export const Send = ({ email, subject, message }:Body) => {
    console.log("sending email", email, subject, message);

    return new Promise((resolve, reject) => {
        transporter.sendMail({
            from: 'yourstruelysaisandeep@gmail.com',
            to: email,
            subject: subject,
            text: "This is a plain text version of your message.", // Plain text version
            html: `
            <div style="background-color: #f4f4f4; padding: 20px; font-family: Arial, sans-serif;">

            <img src="https://play-lh.googleusercontent.com/MjrPI6DZ82LTP0Gt6MtJrAruaAUIa4mj029OJDOpwiyNC4HLcqljzDVohqjDWEhoNl0" alt="Logo" style="width:auto; height:auto;">
            
                <h2 style="color: #333;">${subject}</h2>
                <p style="font-size: 16px; color: #0000FF;">${message} valid for 10 minutes</p>
                <p style="font-size: 14px; color: #777;">Thanks for using our service!</p>
            </div>
        `

        }, (err : any) => {
            if (err) {
                console.log("error", err);
                reject(new Error("email sending error"));
            } else {
                resolve("success");
            }
        });
    });
};


