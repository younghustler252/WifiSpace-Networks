"use client";

import { RouteError } from "@/components/feedback/route-error";

export default function PortalError(props: { error: Error & { digest?: string }; reset: () => void }) {
	return <RouteError {...props} homeHref="/portal" homeLabel="Start again" />;
}