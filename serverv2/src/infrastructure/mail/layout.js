import { brand } from "./brand.js";
import { escapeHtml, safeUrl } from "./html.js";

export default function mailLayout({ content, title, preheader = "" }) {
	const safeTitle = escapeHtml(String(title ?? "").trim() || brand.name);
	const accent = brand.accent;
	const year = new Date().getFullYear();
	const address = brand.address ? `<br />${escapeHtml(brand.address)}` : "";
	const siteUrl = safeUrl(brand.siteUrl);
	const hidden = preheader
		? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(preheader)}</div>`
		: "";

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="color-scheme" content="light" />
	<title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;">
	${hidden}
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px;">
		<tr>
			<td align="center">
				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
					<tr>
						<td align="center" style="padding:28px 24px;background:#111827;border-bottom:4px solid ${accent};">
							<img src="${escapeHtml(brand.logoUrl)}" alt="${escapeHtml(brand.name)}" width="150" style="display:block;border:0;height:auto;max-width:150px;" />
						</td>
					</tr>
					<tr>
						<td style="padding:36px 32px 20px 32px;">
							<h1 style="margin:0 0 20px 0;font-size:24px;line-height:1.3;color:#111827;">${safeTitle}</h1>
							${content}
						</td>
					</tr>
					<tr>
						<td style="padding:0 32px 32px 32px;">
							<p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">Thanks,<br /><strong>The ${escapeHtml(brand.name)} Team</strong></p>
						</td>
					</tr>
					<tr>
						<td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 32px;font-size:12px;line-height:1.6;color:#6b7280;">
							<p style="margin:0 0 10px 0;">Need help? Email <a href="mailto:${escapeHtml(brand.supportEmail)}" style="color:${accent};text-decoration:none;">${escapeHtml(brand.supportEmail)}</a> or call <a href="tel:${escapeHtml(String(brand.supportPhone).replace(/[^+\d]/g, ""))}" style="color:${accent};text-decoration:none;">${escapeHtml(brand.supportPhone)}</a>.</p>
							<p style="margin:0 0 10px 0;">You are receiving this email because of activity on your ${escapeHtml(brand.name)} account. This is a service message, so you cannot unsubscribe from it.</p>
							<p style="margin:0;">&copy; ${year} ${siteUrl ? `<a href="${escapeHtml(siteUrl)}" style="color:#6b7280;text-decoration:none;">${escapeHtml(brand.name)}</a>` : escapeHtml(brand.name)}${address}</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`;
}
