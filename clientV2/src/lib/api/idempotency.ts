"use client";

import { useRef } from "react";

function newKey() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useIdempotencyKey() {
	const ref = useRef<string | null>(null);
	if (!ref.current) ref.current = newKey();
	return ref.current;
}

export const withIdempotency = (key?: string) => (key ? { headers: { "Idempotency-Key": key } } : undefined);