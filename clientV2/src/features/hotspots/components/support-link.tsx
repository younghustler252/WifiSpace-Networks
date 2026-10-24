import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupportPhone, whatsappHref } from "../lib/support";

interface SupportButtonProps {
	message: string;
	label?: string;
}

export function SupportButton({ message, label = "Chat with support on WhatsApp" }: SupportButtonProps) {
	const href = whatsappHref(message);
	const phone = getSupportPhone();

	if (!href && !phone) return null;

	return (
		<div className="space-y-2">
			{href && (
				<Button asChild size="lg" variant="outline" className="w-full bg-surface-2">
					<a href={href}>
						<MessageCircle className="text-success" />
						{label}
					</a>
				</Button>
			)}
			{phone && (
				<a href={`tel:${phone}`} className="flex min-h-11 items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
					<Phone className="size-4" />
					Or call us
				</a>
			)}
		</div>
	);
}

export function SupportFooterLink({ message }: { message: string }) {
	const href = whatsappHref(message);
	if (!href) return null;

	return (
		<a href={href} className="inline-flex min-h-9 items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground">
			<MessageCircle className="size-3.5 text-success" />
			Need help? Chat with us on WhatsApp
		</a>
	);
}
