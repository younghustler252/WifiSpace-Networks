"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { formatMac } from "@/lib/format";
import type { HotspotClientInfo } from "../types/hotspots.types";

const MAC_KEYS = ["mac", "macAddress"];
const IP_KEYS = ["ip", "ipAddress"];
const ORIGIN_KEYS = ["link-orig", "linkOrig", "dst"];

function safeHttpUrl(value?: string) {
	if (!value) return undefined;
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
	} catch {
		return undefined;
	}
}

function pick(params: URLSearchParams, keys: string[]) {
	for (const key of keys) {
		const value = params.get(key);
		if (value) return value;
	}
	return undefined;
}

export function usePortalParams() {
	const searchParams = useSearchParams();
	const query = searchParams.toString();

	return useMemo(() => {
		const params = new URLSearchParams(query);
		const rawMac = pick(params, MAC_KEYS);
		const macAddress = rawMac ? formatMac(rawMac) : undefined;

		const client: HotspotClientInfo | null = macAddress
			? {
					macAddress,
					ipAddress: pick(params, IP_KEYS),
					userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
					routerId: params.get("routerId") ?? undefined,
					routerUid: params.get("routerUid") ?? undefined,
					identity: params.get("identity") ?? undefined,
				}
			: null;

		return {
			client,
			reference: params.get("reference") ?? params.get("trxref") ?? null,
			linkOrig: safeHttpUrl(pick(params, ORIGIN_KEYS)),
		};
	}, [query]);
}