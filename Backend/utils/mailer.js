import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Allowed FROM emails:
// 1. onboarding@resend.dev (works without domain)
// 2. noreply@yourdomain.com (after domain verification)
const FROM_EMAIL = "ZipMart<onboarding@resend.dev>";

// console.log(resend);

const OTP_EMAIL_TEMPLATE = (otp, title, instruction) => {
    const appName = "ZipMart";
    const accentColor = "#4F46E5";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">

    <table align="center" width="100%" style="max-width: 600px; background: #fff; border-radius: 8px;">
        <tr>
            <td align="center" style="padding: 30px 20px 0;">
                <h1 style="color: ${accentColor}; font-size: 24px; margin: 0;">
                    ${appName}
                </h1>
            </td>
        </tr>

        <tr>
            <td align="center" style="padding: 20px 40px;">
                <h2 style="color: #333; font-size: 20px; margin-bottom: 25px;">
                    ${title}
                </h2>

                <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    ${instruction}
                </p>

                <table align="center" style="max-width: 300px; background: #f7f7f7; border: 1px solid #eee; border-radius: 8px; margin-bottom: 30px;">
                    <tr>
                        <td align="center" style="padding: 15px;">
                            <span style="color: #1a1a1a; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                                ${otp}
                            </span>
                        </td>
                    </tr>
                </table>

                <p style="color: #cc0000; font-size: 14px; font-weight: 500; margin-bottom: 30px;">
                    <strong>Important:</strong> OTP valid for 5 minutes. Do not share it.
                </p>

                <p style="color: #777; font-size: 14px;">
                    If this was not you, ignore this email.
                </p>
            </td>
        </tr>

        <tr>
            <td align="center" style="padding: 20px; background: #f9f9f9; border-top: 1px solid #eee;">
                <p style="color: #aaa; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} ${appName}. All rights reserved.
                </p>
            </td>
        </tr>
    </table>

</body>
</html>`;
};

export const sendOtpEmail = async (email, otp) => {
    const title = "Verify Your Identity";
    const instruction =
        "Use the following One-Time Password (OTP) to complete your login or requested action.";

    console.log(email);

    await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: "Your One-Time Verification Code",
        html: OTP_EMAIL_TEMPLATE(otp, title, instruction),
    });
};

export const sendForgotPasswordOtp = async (email, otp) => {
    const title = "Password Reset Verification";
    const instruction =
        "Use this OTP to verify your identity and reset your password.";

    await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: "Password Reset Code (Valid for 5 minutes)",
        html: OTP_EMAIL_TEMPLATE(otp, title, instruction),
    });
};
