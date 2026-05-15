// mail/templates/notification.template.js
import mailLayout from "../layout.js";

export default function notificationTemplate({ name, subject, message }) {
    const content = `
        <h2 style="color:#333;">${subject}</h2>
        <p>Hello ${name},</p>
        <p>${message}</p>
        <p>If you have any questions, please contact our support team.</p>
    `;

    return mailLayout({ content, title: subject });
}