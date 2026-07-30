// mail/templates/otp.template.js
import mailLayout from "../layout.js";

export default function otpTemplate({ name, otp, expiresIn = 10, verificationLink = null }) {
    const content = `
        <div style="text-align:center;">
            <h2 style="color:#111827; font-size:24px; margin-bottom:10px;">Verify Your Account</h2>
            <p style="color:#6b7280; font-size:16px; margin-bottom:30px;">
                Hi ${name}, enter the OTP below to verify your account.
            </p>

            <!-- OTP Code Box -->
            <div style="
                display:inline-block;
                padding:20px 40px;
                background:#f3f4f6;
                border-radius:12px;
                margin-bottom:30px;
                font-size:32px;
                letter-spacing:6px;
                color:#1d4ed8;
                font-weight:bold;
            ">
                ${otp}
            </div>

            <p style="color:#6b7280; font-size:14px; margin-bottom:10px;">
                This code will expire in <strong>${expiresIn} minutes</strong>.
            </p>

            <p style="color:#6b7280; font-size:14px;">
                If you did not request this, you can safely ignore this email.
            </p>

            ${
                verificationLink
                    ? `<a href="${verificationLink}" style="
                        display:inline-block;
                        margin-top:20px;
                        padding:12px 24px;
                        background:#1d4ed8;
                        color:#ffffff;
                        text-decoration:none;
                        border-radius:8px;
                        font-weight:bold;
                    ">Verify Account</a>`
                    : ""
            }
        </div>
    `;

    return mailLayout({ content, title: "Verify Your Account" });
}