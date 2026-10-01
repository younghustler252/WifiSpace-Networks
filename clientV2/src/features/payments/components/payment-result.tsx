"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, ReceiptText, SearchX, XCircle } from "lucide-react";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { usePaymentVerification } from "../hooks/use-payments";

function Actions({ children }: { children: React.ReactNode }) {
	return <div className="space-y-3">{children}</div>;
}

export function PaymentResult() {
	const params = useSearchParams();
	const reference = params.get("reference") ?? params.get("trxref");
	const { successful, failed, timedOut, restart } = usePaymentVerification(reference);

	if (!reference) {
		return (
			<StatusMessage icon={SearchX} tone="warning" title="No payment found" text="We couldn't find a payment to confirm.">
				<Button asChild size="lg" className="w-full">
					<Link href="/overview">Back to overview</Link>
				</Button>
			</StatusMessage>
		);
	}

	if (successful) {
		return (
			<StatusMessage icon={CheckCircle2} tone="success" title="Payment received" text="Your plan is being activated and will be live in a moment.">
				<Button asChild size="lg" className="w-full">
					<Link href="/overview">Go to overview</Link>
				</Button>
			</StatusMessage>
		);
	}

	if (failed) {
		return (
			<StatusMessage
				icon={XCircle}
				tone="destructive"
				title="Payment didn't go through"
				text="We couldn't confirm your payment. If you were charged, contact support and share your reference."
			>
				<Actions>
					<p className="text-mono text-xs text-muted-foreground">Ref: {reference}</p>
					<Button asChild size="lg" className="w-full">
						<Link href="/plans">Try again</Link>
					</Button>
					<Button asChild size="lg" variant="outline" className="w-full bg-surface-2">
						<Link href="/overview">Back to overview</Link>
					</Button>
				</Actions>
			</StatusMessage>
		);
	}

	if (timedOut) {
		return (
			<StatusMessage
				icon={Clock}
				tone="warning"
				title="Still confirming"
				text="This is taking longer than usual. If you've paid, your plan activates automatically, so you don't need to pay again."
			>
				<Actions>
					<Button size="lg" className="w-full" onClick={restart}>
						Check again
					</Button>
					<Button asChild size="lg" variant="outline" className="w-full bg-surface-2">
						<Link href="/overview">Back to overview</Link>
					</Button>
				</Actions>
			</StatusMessage>
		);
	}

	return <StatusMessage icon={ReceiptText} pulse title="Confirming your payment…" text="This usually takes a few seconds." />;
}