import type { Metadata } from "next";
import { ApprovalQueue } from "@/features/accounts/components/approval-queue";

export const metadata: Metadata = { title: "Approvals" };

export default function AdminApprovalsPage() {
	return <ApprovalQueue />;
}