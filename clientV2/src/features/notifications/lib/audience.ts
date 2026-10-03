import { adminUsersApi } from "@/features/users/services/users.api";

const PAGE_LIMIT = 100;
const MAX_PAGES = 20;

export async function fetchActiveCustomerCount(): Promise<number | null> {
	const res = await adminUsersApi.list({ role: "customer", status: "active", page: 1, limit: 1 });
	return res.success ? (res.meta?.total ?? null) : null;
}

async function fetchRoleIds(role: string): Promise<string[] | null> {
	const ids: string[] = [];
	let page = 1;
	let totalPages = 1;

	while (page <= totalPages) {
		if (page > MAX_PAGES) return null;
		const res = await adminUsersApi.list({ role, status: "active", page, limit: PAGE_LIMIT });
		if (!res.success) return null;
		ids.push(...res.data.map((u) => u.id));
		totalPages = res.meta?.totalPages ?? 1;
		page += 1;
	}

	return ids;
}

export async function fetchAudienceIds(roles: string[]): Promise<string[] | null> {
	const results = await Promise.all(roles.map(fetchRoleIds));
	if (results.some((r) => r === null)) return null;
	return Array.from(new Set(results.flatMap((r) => r ?? [])));
}