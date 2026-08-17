"use client";

import { useState } from "react";
import { Wifi, CreditCard, CheckCircle2 } from "lucide-react";

import Modal, { ModalHeader, ModalBody, ModalFooter } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface HotspotGuideModalProps {
	open: boolean;
	onClose: () => void;
}

const STORAGE_KEY = "wifispace-hotspot-guide-dismissed";

export function HotspotGuideModal({ open, onClose }: HotspotGuideModalProps) {
	const [dontShowAgain, setDontShowAgain] = useState(false);

	function handleClose() {
		if (dontShowAgain) {
			try {
				localStorage.setItem(STORAGE_KEY, "true");
			} catch {
				// localStorage unavailable — not worth blocking on, just skip persisting
			}
		}
		onClose();
	}

	return (
		<Modal open={open} onClose={handleClose} size="sm">
			<ModalHeader>How it works</ModalHeader>

			<ModalBody>
				<div className="space-y-4">
					<Step
						icon={<Wifi size={18} />}
						title="Choose a plan"
						description="Pick how long you want to stay connected."
					/>
					<Step
						icon={<CreditCard size={18} />}
						title="Pay"
						description="Card, bank transfer, or apps like Opay and PalmPay all work — you have enough connectivity to complete payment even before you're fully online."
					/>
					<Step
						icon={<CheckCircle2 size={18} />}
						title="You're connected"
						description="No codes to type in — your device connects automatically once payment is confirmed."
					/>
				</div>

				<label className="flex items-center gap-2 mt-5 text-xs text-muted-foreground">
					<input
						type="checkbox"
						checked={dontShowAgain}
						onChange={(e) => setDontShowAgain(e.target.checked)}
					/>
					Don't show this again
				</label>
			</ModalBody>

			<ModalFooter>
				<Button className="w-full" onClick={handleClose}>
					Got it
				</Button>
			</ModalFooter>
		</Modal>
	);
}

function Step({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
	return (
		<div className="flex gap-3">
			<div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent">
				{icon}
			</div>
			<div>
				<div className="text-sm font-medium text-foreground">{title}</div>
				<div className="text-xs text-muted-foreground mt-0.5">{description}</div>
			</div>
		</div>
	);
}

// Helper for the parent page — checks the dismissal flag safely.
export function shouldShowHotspotGuide(): boolean {
	try {
		return localStorage.getItem(STORAGE_KEY) !== "true";
	} catch {
		return true;
	}
}