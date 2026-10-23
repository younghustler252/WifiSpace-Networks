import { API } from "@/lib/api/api-client";
import { Plan } from "@/features/plans/types/plans.types";
import {
	HotspotClientInfo,
	HotspotLoginBody,
	HotspotLoginResult,
	HotspotSession,
	HotspotStartBody,
	HotspotStartResult,
	HotspotStatus,
	HotspotLocation,
	HotspotDevice,
	HotspotRevokeResult,
	HotspotWallet,
	HotspotWalletBody
} from "../types/hotspots.types";

type SessionParams = Pick<HotspotClientInfo, "macAddress" | "ipAddress" | "routerId" | "routerUid" | "routerCode" | "identity">;

export const hotspotsApi = {
	session: (params: SessionParams) => API.get<HotspotSession>("/hotspot/session", { params }),
	plans: () => API.get<Plan[]>("/hotspot/plans"),
	start: (body: HotspotStartBody) => API.post<HotspotStartResult>("/hotspot/start", body),
	wallet: (body: HotspotWalletBody) => API.post<HotspotWallet>("/hotspot/wallet", body),
	login: (body: HotspotLoginBody) => API.post<HotspotLoginResult>("/hotspot/login", body),
	status: (params: { reference: string; macAddress?: string }) =>
		API.get<HotspotStatus>("/hotspot/status", { params }),
	revoke: (macAddress: string) => API.post<HotspotRevokeResult>("/hotspot/revoke", { macAddress }),
};

export const hotspotsAdminApi = {
	devices: (params: { accountId?: string; userId?: string; page?: number; limit?: number }) =>
		API.get<HotspotDevice[]>("/hotspot/admin/devices", { params }),
	locations: (params: { accountId?: string; page?: number; limit?: number }) =>
		API.get<HotspotLocation[]>("/hotspot/admin/locations", { params }),
};