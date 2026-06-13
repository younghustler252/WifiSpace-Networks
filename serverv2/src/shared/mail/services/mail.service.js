import { NodemailerService } from "./nodemailer.service.js";
import { BrevoService } from "./brevo.service.js";
import otpTemplate from "../templates/otp.templates.js";
import notificationTemplate from "../templates/notification.templates.js";

export class MailService {
    constructor() {
        // Use Brevo in production, Nodemailer in dev
        this.client =
            process.env.NODE_ENV === "production"
            ? new BrevoService()
            : new NodemailerService();
    }

    /**
     * Send OTP email
     * @param {Object} params
     * @param {string} params.to
     * @param {string} params.name
     * @param {string|number} params.otp
     * @param {number} params.expiresIn
     */
    async sendOTP({ to, name, otp, expiresIn = 10 }) {
        const html = otpTemplate({ name, otp, expiresIn });
        await this.client.send({
            to,
            subject: "Verify Your Account",
            html
        });
    }

    /**
     * Send general notification email
     * @param {Object} params
     * @param {string} params.to
     * @param {string} params.name
     * @param {string} params.subject
     * @param {string} params.message
     */
    async sendNotification({ to, name, subject, message }) {
        const html = notificationTemplate({ name, subject, message });
        return await this.client.send({
            to,
            subject,
            html
        });
    }
}