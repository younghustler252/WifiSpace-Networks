import { API } from "@/lib/api/api-client";
import { friendly } from "@/lib/api/friendly";
import { ROUTER_ERROR_MESSAGES } from "@/features/routers/constants";
import type { Account, AdminAccount, AdminAccountListParams, RequestAccountBody } from "../types/accounts.types";
import { AdminCreateAccountBody } from "../types/accounts.types";

export const accountsApi = {
	listMine: () => API.get<Account[]>("/accounts/me"),
	getMine: (id: string) => API.get<Account>(`/accounts/me/${id}`),
	request: (body: RequestAccountBody) => API.post<Account>("/accounts/me", body),
	addDevice: (id: string, body: { macAddress: string; hostname?: string }) =>
		API.post<unknown>(`/accounts/me/${id}/devices`, body),
	removeDevice: (id: string, mac: string) =>
		API.delete<unknown>(`/accounts/me/${id}/devices/${encodeURIComponent(mac)}`),
};

const ADMIN = "/accounts/admin";

export const adminAccountsApi = {

	create: (body: AdminCreateAccountBody) => API.post<AdminAccount>(ADMIN, body),
	list: (params: AdminAccountListParams) => API.get<AdminAccount[]>(ADMIN, { params }),
	approve: (id: string, body: { routerId?: string }) =>
		API.patch<AdminAccount>(`${ADMIN}/${id}/approve`, body).then((res) => friendly(res, ROUTER_ERROR_MESSAGES)),
	
	reject: (id: string, note: string) => API.patch<AdminAccount>(`${ADMIN}/${id}/reject`, { note }),
	
	suspend: (id: string) => API.patch<AdminAccount>(`${ADMIN}/${id}/suspend`),
	
	pause: (id: string, note?: string) => API.patch<AdminAccount>(`${ADMIN}/${id}/pause`, { note }),
	
	resume: (id: string) => API.patch<AdminAccount>(`${ADMIN}/${id}/resume`),
	
	terminate: (id: string, note?: string) => API.patch<AdminAccount>(`${ADMIN}/${id}/terminate`, { note }),
};