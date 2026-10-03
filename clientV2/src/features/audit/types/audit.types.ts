export interface AuditLogEntry {
	id: string;
	actorId: string | null;
	actorType: string;
	action: string;
	entity: string;
	entityId: string | null;
	oldValue: Record<string, unknown> | null;
	newValue: Record<string, unknown> | null;
	metadata: Record<string, unknown> | null;
	ip: string | null;
	userAgent: string | null;
	createdAt: string;
}