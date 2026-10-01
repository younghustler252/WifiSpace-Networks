import { API } from "@/lib/api/api-client";
import type { NetworkRouter } from "../types/routers.types";

export const routersApi = {
	list: () => API.get<NetworkRouter[]>("/routers", { params: { limit: 100 } }),
};