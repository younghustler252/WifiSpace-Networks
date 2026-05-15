import { API } from "./client";
import { ApiResponse } from "./types";

// ================================
// REQUEST TYPES
// ================================

interface CreatePlanDto {
	name: string;

	serviceType: "pppoe" | "hotspot";

	accountType?: "personal" | "business" | null;

	price: number;

	speedRate: string;

	durationValue: number;

	durationUnit: "minutes" | "hours" | "days" | "months";

	dataLimitBytes?: number;

	devicesAllowed?: number;

	features?: string[];

	mikrotikProfile: string;
}

interface UpdatePlanDto extends Partial<CreatePlanDto> {}
// ================================
// RESPONSE TYPES (optional but recommended)
// ================================

export interface Plan {
	id: string;
	name: string;

	serviceType: "pppoe" | "hotspot";

	accountType?: "personal" | "business" | null;

	price: number;
	speedRate: string;

	durationValue: number;
	durationUnit: "minutes" | "hours" | "days" | "months";

	devicesAllowed: number;
	features: string[];

	mikrotikProfile: string;

	status: string;

	createdAt: string;
	updatedAt: string;
}

export interface PlanListData {
	data: Plan[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}
// ================================
// PLAN API
// ================================

export const planApi = {
	// -----------------------------
	// AUTHENTICATED USERS
	// -----------------------------

	getAll: (
		params?: {
			serviceType?: "pppoe" | "hotspot";

			accountType?: "personal" | "business";

			sort?: string;

			page?: number;

			limit?: number;
		}
	): Promise<ApiResponse<PlanListData>> =>
		API.get("/plans", { params }),

	getById: (id: string): Promise<ApiResponse<Plan>> =>
		API.get(`/plans/${id}`),

	// -----------------------------
	// STAFF / SUPERADMIN
	// -----------------------------

	create: (
		data: CreatePlanDto
	): Promise<ApiResponse<Plan>> =>
		API.post("/plans/create", data),

	update: (
		id: string,
		data: UpdatePlanDto
	): Promise<ApiResponse<Plan>> =>
		API.patch(`/plans/${id}`, data),

	remove: (id: string): Promise<ApiResponse<null>> =>
		API.delete(`/plans/${id}`),
};