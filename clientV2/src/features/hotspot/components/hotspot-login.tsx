"use client";

import { useState } from "react";
import { useAuthenticateHotspot } from "../hooks/useHotspot";

interface RouterContext {
	macAddress: string | null;
	ipAddress: string | null;
	identity: string | null;
}

interface HotspotLoginProps {
	routerContext: RouterContext;
	prefillEmail?: string;
	contextMessage?: string; // NEW — e.g. "Welcome back. Please login to continue."
	onAuthenticated: () => void;
}

export function HotspotLogin({ routerContext, prefillEmail, contextMessage, onAuthenticated }: HotspotLoginProps) {
	const authenticate = useAuthenticateHotspot();

	const [email, setEmail] = useState(prefillEmail ?? "");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit() {
		setError(null);

		if (!email || !password) {
			setError("Email and password are required.");
			return;
		}
		if (!routerContext.macAddress) {
			setError("We couldn't detect your device. Please reconnect to WiFi.");
			return;
		}

		try {
			await authenticate.mutateAsync({
				email,
				password,
				macAddress: routerContext.macAddress,
				ipAddress: routerContext.ipAddress ?? "",
				identity: routerContext.identity ?? undefined
			});

			onAuthenticated();
		} catch (err) {
			// Backend throws UnauthorizedError("Invalid credentials") for both
			// wrong email and wrong password — deliberately vague, don't split
			// that out client-side either.
			setError(err instanceof Error ? err.message : "Invalid credentials.");
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{contextMessage || "Enter your details to reconnect."}
				</p>
			</div>

			<div className="space-y-3">
				<div className="space-y-1.5">
					<label className="text-sm text-muted-foreground">Email</label>
					<input
						type="email"
						className="ui-input"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<label className="text-sm text-muted-foreground">Password</label>
					<input
						type="password"
						className="ui-input"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Your phone number, if you haven't changed it"
					/>
				</div>
			</div>

			{error && <div className="text-sm text-danger">{error}</div>}

			<button
				className="w-full ui-button ui-button-accent"
				onClick={handleSubmit}
				disabled={authenticate.isPending}
			>
				{authenticate.isPending ? "Signing in…" : "Sign in"}
			</button>
		</div>
	);
}