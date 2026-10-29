import mailLayout from "../layout.js";
import { brand } from "../brand.js";
import { button, escapeHtml, greeting, greetingText, paragraphs } from "../html.js";

export const DEFAULT_NOTIFICATION_TITLE = "Notification";

export default function notificationTemplate({ name, title, message, action = null }) {
	const heading = String(title ?? "").trim() || `${DEFAULT_NOTIFICATION_TITLE} from ${brand.name}`;
	const body = String(message ?? "").trim();

	const content = `
		<p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#374151;">${greeting(name)}</p>
		${paragraphs(body)}
		${action ? button({ label: action.label, url: action.url, accent: brand.accent }) : ""}
		<p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#6b7280;">If you have any questions, just reply to this email or contact our support team.</p>
	`;

	const html = mailLayout({ content, title: heading, preheader: body.replace(/\s+/g, " ").slice(0, 110) });
	const actionText = action?.url ? `\n\n${action.label ?? "Open"}: ${action.url}` : "";
	const text = `${heading}\n\n${greetingText(name)}\n\n${body}${actionText}\n\nIf you have any questions, just reply to this email or contact our support team.\n\nThe ${brand.name} Team`;

	return { subject: heading, title: heading, html, text };
}
