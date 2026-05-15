import "dotenv/config";
import * as Brevo from "@getbrevo/brevo";

export class BrevoService {
    constructor() {
        const client = new Brevo.TransactionalEmailsApi();

        client.setApiKey(
            Brevo.TransactionalEmailsApiApiKeys.apiKey,
            process.env.BREVO_API_KEY
        );

        this.client = client;

        // Load sender from env
        this.sender = {
            email: process.env.BREVO_SENDER_EMAIL,
            name: process.env.BREVO_SENDER_NAME
        };

        if (!process.env.BREVO_API_KEY) {
            throw new Error("Missing BREVO_API_KEY in .env");
        }

        if (!this.sender.email || !this.sender.name) {
            throw new Error("Missing BREVO_SENDER_EMAIL or BREVO_SENDER_NAME in .env");
        }
    }

    async send({ to, subject, html, sender = null }) {
        try {
            const response = await this.client.sendTransacEmail({
                sender: sender || this.sender,
                to: Array.isArray(to)
                    ? to.map(email => ({ email }))
                    : [{ email: to }],
                subject,
                htmlContent: html
            });

            return response;
        } catch (err) {
            console.error(
                "Brevo email error:",
                err?.response?.body || err.message || err
            );
            throw err;
        }
    }
}