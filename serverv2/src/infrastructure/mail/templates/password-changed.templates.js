import mailLayout from "../layout.js";
import { brand } from "../brand.js";
import { escapeHtml, greeting, greetingText } from "../html.js";

export default function passwordChangedTemplate({ name }) {
	const title = "Your password was changed";
	const line1 = "An administrator has set a new password for your account. You can now sign in with the new password.";
	const line2 = `If you were not expecting this change, please contact us right away at ${brand.supportEmail}.`;

	const content = `
		<p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#374151;">${greeting(name)}</p>
		<p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#374151;">${escapeHtml(line1)}</p>
		<p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#374151;">${escapeHtml(line2)}</p>
	`;

	const html = mailLayout({ content, title, preheader: "A new password was set on your account." });
	const text = `${title}\n\n${greetingText(name)}\n\n${line1}\n\n${line2}\n\nThe ${brand.name} Team`;

	return { subject: title, title, html, text };
}
