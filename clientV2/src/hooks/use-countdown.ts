"use client";

import { useEffect, useState } from "react";

function secondsUntil(target?: string | null) {
	if (!target) return 0;
	return Math.max(0, Math.ceil((new Date(target).getTime() - Date.now()) / 1000));
}

export function useCountdown(target?: string | null) {
	const [seconds, setSeconds] = useState(0);

	useEffect(() => {
		setSeconds(secondsUntil(target));
		if (!target) return;
		const id = setInterval(() => {
			const next = secondsUntil(target);
			setSeconds(next);
			if (next === 0) clearInterval(id);
		}, 1000);
		return () => clearInterval(id);
	}, [target]);

	return seconds;
}