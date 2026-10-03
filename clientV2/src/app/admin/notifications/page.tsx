import type { Metadata } from "next";
import { NotificationsAdmin } from "@/features/notifications/components/notifications-admin";

export const metadata: Metadata = { title: "Broadcasts" };

export default function AdminNotificationsPage() {
	return <NotificationsAdmin />;
}