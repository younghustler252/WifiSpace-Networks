import { API } from "@/lib/api/api-client";
import type { Subscription } from "../types/subscriptions.types";

export const subscriptionsApi = {
	listMine: () => API.get<Subscription[]>("/subscriptions/me"),
};