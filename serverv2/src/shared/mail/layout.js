// mail/layout.js
export default function mailLayout ({ content, title = "Wifispace" }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial, sans-serif;">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
            <tr>
                <td align="center">
                    
                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
                        
                        <!-- HEADER -->
                        <tr>
                            <td align="center" style="padding:20px;background:#111827;">
                                <img 
                                    src="https://wifispace.netlify.app/wifispaceDark.png" 
                                    alt="Company Logo" 
                                    width="150"
                                    style="display:block;"
                                />
                            </td>
                        </tr>

                        <!-- CONTENT -->
                        <tr>
                            <td style="padding:30px;">
                                ${content}
                            </td>
                        </tr>

                        <!-- FOOTER -->
                        <tr>
                            <td style="background:#f9fafb;padding:20px;font-size:12px;color:#6b7280;line-height:1.5;">

                                <p style="margin:0 0 10px 0;">
                                    You are receiving this email because you have an account with us.
                                </p>

                                <p style="margin:0 0 10px 0;">
                                    <strong>Wifispace Unlimited Networks</strong><br/>
                                    10b Long Street<br/>
                                    Johannesburg, South Africa
                                </p>

                                <p style="margin:0 0 10px 0;">
                                    Need help? Contact our support team:<br/>
                                    Email: 
                                    <a href="mailto:wsnsupport@uhs.com.ng" style="color:#4f46e5;">
                                        wsnsupport@uhs.com.ng
                                    </a><br/>
                                    Phone: 
                                    <a href="tel:+23481377309929" style="color:#4f46e5;">
                                        +234 813 773 09929
                                    </a>
                                </p>

                                <p style="margin:0;">
                                    <a href="https://wifispace.net" style="color:#4f46e5;">
                                        Manage newsletter preferences
                                    </a>
                                </p>

                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};