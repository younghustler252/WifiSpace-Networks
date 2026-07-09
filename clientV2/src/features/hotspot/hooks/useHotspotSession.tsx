"use client";

import { useEffect, useState } from "react";
import {
	hotspotApi,
	HotspotPlan,
	HotspotSession,
} from "@/lib/api/hotspot";

declare global {
	interface Window {
		PaystackPop: any;
	}
}

type State =
	| "LOADING"
	| "SELECT_PLAN"
	| "IDENTITY_LOOKUP"
	| "REGISTER_USER"
	| "PAYMENT_PROCESSING"
	| "SUCCESS"
	| "ERROR";

export function useHotspotSession(
	macAddress?: string,
	email?: string,
	ipAddress?: string
) {
	const [state, setState] = useState<State>("LOADING");
	const [session, setSession] = useState<HotspotSession | null>(null);
	const [plans, setPlans] = useState<HotspotPlan[]>([]);
	const [selectedPlan, setSelectedPlan] = useState<HotspotPlan | null>(null);
	const [paymentResult, setPaymentResult] = useState<any>(null);
	const [error, setError] = useState("");


	const canGoBack =
		state === "IDENTITY_LOOKUP" ||
		state === "REGISTER_USER";

	const goBack = () => {
		setError("");
		setState("SELECT_PLAN");
	};

	const loadSession = async () => {
		try {
			setState("LOADING");
			setError("");

			const { data: session } = await hotspotApi.getSession({
				macAddress,
				email,
			});

			setSession(session);

			const { data } = await hotspotApi.getPlans();
			setPlans(data.data);

			setState("SELECT_PLAN");
		} catch (err: any) {
			setState("ERROR");

			setError(
				err?.response?.data?.message ??
					err?.message ??
					"Failed loading hotspot"
			);
		}
	};

	const lookupAccount = async (userEmail: string) => {
		try {
			setError("");
			setState("LOADING");

			const { data: session } = await hotspotApi.getSession({
				email: userEmail,
			});

			setSession(session);

			if (session.hasHotspotAccount) {
				setState("SELECT_PLAN");
				return;
			}

			setError("No hotspot account found. Continue as new user.");
			setState("SELECT_PLAN");
		} catch (err: any) {
			setState("IDENTITY_LOOKUP");

			setError(
				err?.response?.data?.message ??
					"Account lookup failed"
			);
		}
	};

	const startPayment = async (
		customer: {
			firstName: string;
			email: string;
			phone: string;
		},
		plan: HotspotPlan
	) => {
		try {
			setState("PAYMENT_PROCESSING");

			const { data } = await hotspotApi.startPurchase({
				firstName: customer.firstName,
				email: customer.email,
				phone: customer.phone,
				planId: plan.id,
				macAddress: macAddress ?? "",
				ipAddress: ipAddress ?? "",
				userAgent: navigator.userAgent,
			});

			const url =
				data.payment.paystack.data.authorization_url;

			if (!url) {
				throw new Error("Paystack URL missing");
			}

			window.location.href = url;
		} catch (err: any) {
			setState("ERROR");

			setError(
				err?.response?.data?.message ??
					err?.message ??
					"Payment failed"
			);
		}
	};

	const confirmPayment = async (reference: string) => {
		try {
			const { data } =
				await hotspotApi.confirmPurchase({
					reference,
				});

			setPaymentResult(data);
			setState("SUCCESS");
		} catch (err: any) {
			setState("ERROR");

			setError(
				err?.response?.data?.message ??
					"Payment confirmation failed"
			);
		}
	};

	const actions = {
		selectPlan: async (plan: HotspotPlan) => {
			setSelectedPlan(plan);

			if (session?.user) {
				return startPayment(
					{
						firstName: session.user.firstName,
						email: session.user.email,
						phone: session.user.phone,
					},
					plan
				);
			}
			setState("REGISTER_USER");
		},

		registerUser: async (form: any) => {
			if (!selectedPlan) {
				throw new Error("Select plan first");
			}

			return startPayment(form, selectedPlan);
		},

		lookupAccount,

		showIdentity: () => {
			setError("");
			setState("IDENTITY_LOOKUP");
		},

		retry: loadSession,

		browse: () => {
			window.location.href = "/";
		},

		dashboard: () => {
			window.location.href = "/dashboard";
		},
		goBack,
	};

	useEffect(() => {
		loadSession();
	}, []);

	return {
		state,
		canGoBack,
		error,
		session,
		plans,
		selectedPlan,
		paymentResult,
		actions,
		reload: loadSession,
		confirmPayment,
	};
}