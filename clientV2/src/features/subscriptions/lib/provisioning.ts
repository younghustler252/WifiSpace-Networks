import { toast } from "sonner";

export type ProvisioningState = "pending" | "failed" | "awaiting_device" | "skipped";

const STATES: ProvisioningState[] = ["pending", "failed", "awaiting_device", "skipped"];

export function readProvisioning(data: unknown): ProvisioningState | null {
	if (!data || typeof data !== "object") return null;

	const raw = (data as Record<string, unknown>).provisioning;
	const value = typeof raw === "string" ? raw : raw && typeof raw === "object" ? (raw as Record<string, unknown>).status : null;
	return STATES.find((state) => state === value) ?? null;
}

const MESSAGES: Record<Exclude<ProvisioningState, "skipped">, { warn: boolean; text: string }> = {
	pending: { warn: false, text: "We're setting up the router now. The subscription page shows the result." },
	awaiting_device: { warn: false, text: "It switches on automatically when the customer first connects at a hotspot." },
	failed: { warn: true, text: "We couldn't queue the router update. Open the subscription and use Re-sync provisioning." },
};

export function toastWithProvisioning(title: string, data: unknown) {
	const state = readProvisioning(data);

	if (!state || state === "skipped") {
		toast.success(title);
		return;
	}

	const info = MESSAGES[state];
	if (info.warn) toast.warning(title, { description: info.text, duration: 12_000 });
	else toast.success(title, { description: info.text });
}