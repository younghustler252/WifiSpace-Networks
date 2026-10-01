"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { HotspotClientInfo } from "../types/hotspots.types";

const MAC_KEYS = ["mac", "macAddress"];
const IP_KEYS = ["ip", "ipAddress"];

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
		const macAddress = pick(params, MAC_KEYS);

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

		return { client, reference: params.get("reference") ?? params.get("trxref") ?? null };
	}, [query]);
}