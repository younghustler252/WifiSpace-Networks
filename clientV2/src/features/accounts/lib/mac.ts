export type MacCheck =
	| { state: "empty" }
	| { state: "typing"; count: number }
	| { state: "invalid"; reason: string }
	| { state: "valid"; mac: string };

export function parseMac(input: string) {
	const digits = input.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
	if (digits.length !== 12) return null;
	return digits.match(/.{2}/g)!.join(":");
}

export function checkMac(input: string): MacCheck {
	const value = input.trim();
	if (!value) return { state: "empty" };

	const stray = value.replace(/[0-9a-fA-F:.\-\s]/g, "");
	if (stray) return { state: "invalid", reason: `"${stray[0]}" isn't allowed. A MAC only has 0-9 and A-F.` };

	const digits = value.replace(/[^0-9a-fA-F]/g, "");
	if (digits.length < 12) return { state: "typing", count: digits.length };
	if (digits.length > 12) return { state: "invalid", reason: `That has ${digits.length} characters. A MAC has exactly 12.` };

	const mac = parseMac(value)!;
	if (/^0+$/.test(digits)) return { state: "invalid", reason: "00:00:00:00:00:00 isn't a real device address." };
	if (/^F+$/i.test(digits)) return { state: "invalid", reason: "FF:FF:FF:FF:FF:FF is a broadcast address, not a device." };
	if (parseInt(digits.slice(0, 2), 16) & 1) return { state: "invalid", reason: "The first pair is odd, which makes it a group address. Check the first two characters." };

	return { state: "valid", mac };
}

export function macMessage(input: string, required = true) {
	const check = checkMac(input);
	if (check.state === "valid") return null;
	if (check.state === "empty") return required ? "Enter the MAC address" : null;
	if (check.state === "typing") return `A MAC has 12 characters. You've entered ${check.count}.`;
	return check.reason;
}
