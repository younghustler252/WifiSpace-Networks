"use client";

import { RouteError } from "@/components/feedback/route-error";

export default function AdminError(props: { error: Error & { digest?: string }; reset: () => void }) {
	return <RouteError {...props} homeHref="/admin/dashboard" homeLabel="Back to dashboard" />;
}