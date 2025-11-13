import nodemailer from 'nodemailer';
import dotenv from 'dotenv'

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Refactored template to accept dynamic title and instructions for reuse
const OTP_EMAIL_TEMPLATE = (otp, title, instruction) => {
    const appName = "Auth App";
    const accentColor = "#4F46E5";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f4f4f4;">

    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <tr>
            <td align="center" style="padding: 30px 20px 0px 20px;">
                <h1 style="color: ${accentColor}; font-size: 24px; margin: 0; padding: 0;">${appName}</h1>
            </td>
        </tr>

        <!-- Main Content Area -->
        <tr>
            <td align="center" style="padding: 20px 40px;">
                <h2 style="color: #333333; font-size: 20px; font-weight: 600; margin-bottom: 25px;">${title}</h2>
                
                <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    ${instruction}
                </p>

                <!-- OTP Display Box -->
                <table align="center" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 300px; margin-bottom: 30px; border-radius: 8px; overflow: hidden; background-color: #f7f7f7; border: 1px solid #e0e0e0;">
                    <tr>
                        <td align="center" style="padding: 15px 20px;">
                            <span style="color: #1a1a1a; font-size: 32px; font-weight: bold; letter-spacing: 5px; display: block;">
                                ${otp}
                            </span>
                        </td>
                    </tr>
                </table>
                
                <p style="color: #cc0000; font-size: 14px; font-weight: 500; margin-bottom: 30px;">
                    <strong>Important:</strong> This code is valid for only 5 minutes. Please do not share this code with anyone.
                </p>

                <p style="color: #777777; font-size: 14px;">
                    If you did not request this, you can safely ignore this email.
                </p>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td align="center" style="padding: 20px; background-color: #f9f9f9; border-top: 1px solid #eeeeee;">
                <p style="color: #aaaaaa; font-size: 12px; margin: 0;">
                    &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
                </p>
            </td>
        </tr>
    </table>

</body>
</html>
  `;
};

export const sendOtpEmail = async(email, otp) => {
    const title = "Verify Your Identity";
    const instruction = "Use the following One-Time Password (OTP) to complete your login or requested action.";

    await transporter.sendMail({
        from: `"Auth App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your One-Time Verification Code",
        html: OTP_EMAIL_TEMPLATE(otp, title, instruction)
    });
};


export const sendForgotPasswordOtp = async(email, otp) => {
    const title = "Password Reset Verification";
    const instruction = "You requested a password reset. Use the following One-Time Password (OTP) to verify your identity and set a new password.";

    await transporter.sendMail({
        from: `"Auth App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Code (Valid for 5 minutes)",
        html: OTP_EMAIL_TEMPLATE(otp, title, instruction)
    });
};