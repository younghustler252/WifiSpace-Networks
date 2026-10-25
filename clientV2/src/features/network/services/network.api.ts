import { API } from "@/lib/api/api-client";
import { friendly } from "@/lib/api/friendly";
import type { ApiResponse } from "@/types/api-response";
import { NETWORK_ERROR_MESSAGES } from "../constants";
import type {
	CreateHotspotProfileBody,
	CreateWalledGardenBody,
	HotspotProfile,
	HotspotProfileFields,
	ImportBody,
	ImportResult,
	NetworkStatus,
	SyncBody,
	SyncOneResult,
	SyncQueued,
	WalledGardenEntry,
	WalledGardenFields,
} from "../types/network.types";

const BASE = "/network-config";

const withMessages = <T>(request: Promise<ApiResponse<T>>) => request.then((res) => friendly(res, NETWORK_ERROR_MESSAGES));

export const networkApi = {
	status: () => withMessages(API.get<NetworkStatus>(`${BASE}/status`)),

	profiles: () => withMessages(API.get<HotspotProfile[]>(`${BASE}/hotspot-profiles`)),
	createProfile: (body: CreateHotspotProfileBody) => withMessages(API.post<HotspotProfile>(`${BASE}/hotspot-profiles`, body)),
	updateProfile: (id: string, body: HotspotProfileFields) => withMessages(API.patch<HotspotProfile>(`${BASE}/hotspot-profiles/${id}`, body)),
	deleteProfile: (id: string) => withMessages(API.delete<unknown>(`${BASE}/hotspot-profiles/${id}`)),

	walledGarden: () => withMessages(API.get<WalledGardenEntry[]>(`${BASE}/walled-garden`)),
	createEntry: (body: CreateWalledGardenBody) => withMessages(API.post<WalledGardenEntry>(`${BASE}/walled-garden`, body)),
	updateEntry: (id: string, body: WalledGardenFields) => withMessages(API.patch<WalledGardenEntry>(`${BASE}/walled-garden/${id}`, body)),
	deleteEntry: (id: string) => withMessages(API.delete<{ id: string }>(`${BASE}/walled-garden/${id}`)),

	importConfig: (body: ImportBody) => withMessages(API.post<ImportResult>(`${BASE}/import`, body)),
	syncAll: () => withMessages(API.post<SyncQueued>(`${BASE}/sync`, {})),
	syncRouter: (body: SyncBody) => withMessages(API.post<SyncOneResult>(`${BASE}/sync`, body)),
};
