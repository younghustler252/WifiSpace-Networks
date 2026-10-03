import { API } from "@/lib/api/api-client";
import type { AuditLogEntry } from "../types/audit.types";

export const auditApi = {
	listAll: (params: { page?: number; limit?: number }) => API.get<AuditLogEntry[]>("/audit/admin", { params }),
	listMine: (params: { page?: number; limit?: number }) => API.get<AuditLogEntry[]>("/audit/me", { params }),
};