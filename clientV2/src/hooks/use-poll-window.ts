"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function usePollWindow(maxMs: number) {
	const startedAt = useRef(Date.now());
	const [expired, setExpired] = useState(false);
	const [round, setRound] = useState(0);

	useEffect(() => {
		startedAt.current = Date.now();
		setExpired(false);
		const id = setTimeout(() => setExpired(true), maxMs);
		return () => clearTimeout(id);
	}, [round, maxMs]);

	const isOpen = useCallback(() => Date.now() - startedAt.current < maxMs, [maxMs]);
	const restart = useCallback(() => setRound((r) => r + 1), []);

	return { expired, isOpen, restart };
}