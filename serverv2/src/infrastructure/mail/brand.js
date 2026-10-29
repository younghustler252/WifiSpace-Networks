const env = process.env;

export const brand = {
	get name() {
		return env.MAIL_BRAND_NAME || "WifiSpace";
	},
	get logoUrl() {
		return env.MAIL_LOGO_URL || "https://fiberlink.uhs.com.ng/brand/logo.png";
	},
	get siteUrl() {
		return env.MAIL_SITE_URL || env.FRONTEND_URL || "https://fiberlink.uhs.com.ng";
	},
	get supportEmail() {
		return env.MAIL_SUPPORT_EMAIL || "wsnsupport@uhs.com.ng";
	},
	get supportPhone() {
		return env.MAIL_SUPPORT_PHONE || "+234 813 773 09929";
	},
	get address() {
		return env.MAIL_COMPANY_ADDRESS || "No 7b Tijani street, iyana ipaja, lagos ";
	},
	get accent() {
		return env.MAIL_ACCENT_COLOR || "#2563eb";
	}
};
