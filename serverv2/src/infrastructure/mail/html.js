const ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(value) {
	return String(value ?? "").replace(/[&<>"']/g, (char) => ENTITIES[char]);
}

export function safeUrl(value) {
	const url = String(value ?? "").trim();
	return /^https?:\/\//i.test(url) || /^mailto:/i.test(url) ? url : "";
}

export function greeting(name) {
	const clean = String(name ?? "").trim();
	return clean ? `Hello ${escapeHtml(clean)},` : "Hello,";
}

export function greetingText(name) {
	const clean = String(name ?? "").trim();
	return clean ? `Hello ${clean},` : "Hello,";
}

export function paragraphs(text, style = "margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#374151;") {
	return String(text ?? "")
		.replace(/\r\n/g, "\n")
		.split(/\n{2,}/)
		.map((block) => block.trim())
		.filter(Boolean)
		.map((block) => `<p style="${style}">${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
		.join("");
}

export function button({ label, url, accent }) {
	const href = safeUrl(url);
	if (!href || !label) return "";
	return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px 0;">
		<tr>
			<td align="center" bgcolor="${accent}" style="border-radius:8px;">
				<a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
			</td>
		</tr>
	</table>`;
}

export function htmlToText(html) {
	return String(html ?? "")
		.replace(/<(style|script|head)[\s\S]*?<\/\1>/gi, "")
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/(p|h1|h2|h3|tr|div|li)>/gi, "\n\n")
		.replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)")
		.replace(/<[^>]+>/g, "")
		.replace(/&nbsp;/g, " ")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, "&")
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}
