import { API } from "@/lib/api/api-client";
import { friendly } from "@/lib/api/friendly";
import type { ApiResponse } from "@/types/api-response";
import { ROUTER_ERROR_MESSAGES } from "../constants";
import type { CreateRouterBody, NetworkRouter, UpdateRouterBody } from "../types/routers.types";

const withMessages = <T>(request: Promise<ApiResponse<T>>) => request.then((res) => friendly(res, ROUTER_ERROR_MESSAGES));

export const routersApi = {
	list: (params?: { page?: number; limit?: number }) => withMessages(API.get<NetworkRouter[]>("/routers", { params })),
	create: (body: CreateRouterBody) => withMessages(API.post<NetworkRouter>("/routers", body)),
	update: (id: string, body: UpdateRouterBody) => withMessages(API.patch<NetworkRouter>(`/routers/${id}`, body)),
	sync: (id: string) => withMessages(API.post<unknown>(`/routers/${id}/sync`)),
	syncAll: () => withMessages(API.post<unknown>("/routers/sync-all")),
	reboot: (id: string) => withMessages(API.post<unknown>(`/routers/${id}/reboot`)),
	remove: (id: string) => withMessages(API.delete<unknown>(`/routers/${id}`)),
	profiles: (id: string, serviceType: string) =>
	withMessages(API.get<unknown>(`/routers/${id}/profiles`, { params: { serviceType } })),
};