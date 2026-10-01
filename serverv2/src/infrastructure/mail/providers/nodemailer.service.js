import nodemailer from "nodemailer";

export class NodemailerService {
    constructor() {
        this.ready = this.init();
    }

    async init() {
        const testAccount = await nodemailer.createTestAccount();

        this.transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    }

    async send({ to, subject, html }) {
        await this.ready; // ensure init finished

        const info = await this.transporter.sendMail({
            from: '"Wifispace" <no-reply@wifispace.net>',
            to,
            subject,
            html
        });

        console.log("📧 Preview URL:", nodemailer.getTestMessageUrl(info));
        return info;
    }
}