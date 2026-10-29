import mailLayout from "../layout.js";
import { brand } from "../brand.js";
import { escapeHtml, greeting, greetingText, htmlToText } from "../html.js";

const PURPOSES = {
	verify: {
		subject: "Verify your email address",
		title: "Verify your email address",
		intro: `Thanks for joining {brand}. Use the code below to verify your email address.`,
		ignore: "If you did not create an account, you can safely ignore this email."
	},
	reset: {
		subject: "Reset your password",
		title: "Reset your password",
		intro: "We received a request to reset your password. Use the code below to continue.",
		ignore: "If you did not request a password reset, you can safely ignore this email. Your password will stay the same."
	}
};

export default function otpTemplate({ name, otp, expiresIn = 10, purpose = "verify" }) {
	const copy = PURPOSES[purpose] ?? PURPOSES.verify;
	const intro = copy.intro.replace("{brand}", brand.name);
	const code = escapeHtml(String(otp ?? "").trim());
	const minutes = Number(expiresIn) || 10;
	const unit = minutes === 1 ? "minute" : "minutes";

	const content = `
		<p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#374151;">${greeting(name)}</p>
		<p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#374151;">${escapeHtml(intro)}</p>
		<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
			<tr>
				<td align="center" style="padding:22px 16px;background:#f3f4f6;border:1px dashed #d1d5db;border-radius:12px;">
					<span style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:bold;letter-spacing:10px;color:${brand.accent};">${code}</span>
				</td>
			</tr>
		</table>
		<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#374151;">This code expires in <strong>${minutes} ${unit}</strong>. Never share it with anyone. ${escapeHtml(brand.name)} will never ask you for it.</p>
		<p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#6b7280;">${escapeHtml(copy.ignore)}</p>
	`;

	const html = mailLayout({ content, title: copy.title, preheader: `Your code is ${String(otp ?? "").trim()}. It expires in ${minutes} ${unit}.` });
	const text = `${copy.title}\n\n${greetingText(name)}\n\n${intro}\n\nYour code: ${String(otp ?? "").trim()}\n\nThis code expires in ${minutes} ${unit}. Never share it with anyone.\n\n${copy.ignore}\n\nThe ${brand.name} Team`;

	return { subject: copy.subject, title: copy.title, html, text: text || htmlToText(html) };
}
