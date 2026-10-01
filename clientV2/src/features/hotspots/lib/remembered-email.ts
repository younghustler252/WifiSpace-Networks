const KEY = "wifispace:portal-email";

export function readRememberedEmail() {
	try {
		return window.localStorage.getItem(KEY) ?? "";
	} catch {
		return "";
	}
}

export function rememberEmail(email: string) {
	try {
		window.localStorage.setItem(KEY, email);
	} catch {
		return;
	}
}