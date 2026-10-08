"use client";

import { useRef } from "react";

function newKey() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useIdempotencyKey(fingerprint = "") {
	const ref = useRef<{ fingerprint: string; key: string } | null>(null);

	if (!ref.current || ref.current.fingerprint !== fingerprint) {
		ref.current = { fingerprint, key: newKey() };
	}

	return ref.current.key;
}

export const withIdempotency = (key?: string) => (key ? { headers: { "Idempotency-Key": key } } : undefined);