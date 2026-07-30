"use client";

import { useState } from "react";
import type { HotspotPlan } from "../api/hotspot.types";

export type HotspotStep =
	| "landing"
	| "choice"
	| "login"
	| "plans"
	| "register"
	| "payment"
	| "success"
	| "connected";

export function useHotspotFlow() {
	const [step, setStep] = useState<HotspotStep>("landing");
	const [plan, setPlan] = useState<HotspotPlan | null>(null);

	const goTo = (step: HotspotStep) => {
		setStep(step);
	};

	const reset = () => {
		setStep("landing");
		setPlan(null);
	};

	return {
		step,
		goTo,

		plan,
		setPlan,

		reset,
	};
}