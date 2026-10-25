import { z } from "zod";
import { WALLED_GARDEN_KIND_LIST, HOST_ACTIONS, IP_ACTIONS, OPEN_STATUS_PAGE_VALUES } from "../domain/network-config.enum.js";

const duration = z.string().regex(/^\d+[smhdw]$/, "Use a duration like 30m, 12h or 3d");
const idle = z.string().regex(/^(none|\d+[smhdw])$/, "Use none or a duration like 10m");
const port = z.string().regex(/^\d{1,5}(-\d{1,5})?$/, "Use a port like 443 or a range like 8000-8100");
const host = z.string().min(1).max(253).regex(/^[A-Za-z0-9*?.\-]+$/, "Host may only contain letters, numbers, dots, dashes and the wildcards * and ?");
const address = z.string().regex(/^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2})?$/, "Use an IPv4 address or CIDR like 10.0.0.0/24");
const text = z.string().max(100).regex(/^[^\r\n"]*$/, "No quotes or line breaks");

export const createHotspotProfileSchema = z.object({
	name: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9 ._-]{0,39}$/, "Name may contain letters, numbers, spaces, dots, dashes and underscores (max 40)"),
	uploadMbps: z.number().int().min(1).max(10000),
	downloadMbps: z.number().int().min(1).max(10000),
	sharedUsers: z.number().int().min(1).max(100).optional(),
	macCookieTimeout: duration.optional(),
	idleTimeout: idle.optional(),
	statusAutorefresh: duration.optional(),
	addMacCookie: z.boolean().optional(),
	transparentProxy: z.boolean().optional(),
	openStatusPage: z.enum(OPEN_STATUS_PAGE_VALUES).optional(),
	advertise: z.boolean().optional(),
	description: text.nullable().optional()
});

export const updateHotspotProfileSchema = createHotspotProfileSchema.omit({ name: true }).partial();

const entryBase = z.object({
	kind: z.enum(WALLED_GARDEN_KIND_LIST),
	dstHost: host.nullable().optional(),
	dstAddress: address.nullable().optional(),
	protocol: z.enum(["tcp", "udp", "icmp"]).nullable().optional(),
	dstPort: port.nullable().optional(),
	path: z.string().max(200).regex(/^[^\r\n"]*$/).nullable().optional(),
	action: z.string().optional(),
	description: text.nullable().optional(),
	enabled: z.boolean().optional()
});

function refineEntry(data, ctx) {
	if (data.kind === "host") {
		if (!data.dstHost) ctx.addIssue({ code: "custom", path: ["dstHost"], message: "dstHost is required for a host entry" });
		if (data.action && !HOST_ACTIONS.includes(data.action)) ctx.addIssue({ code: "custom", path: ["action"], message: `action must be one of ${HOST_ACTIONS.join(", ")}` });
		if (data.dstAddress || data.protocol) ctx.addIssue({ code: "custom", path: ["kind"], message: "dstAddress and protocol only apply to ip entries" });
	} else if (data.kind === "ip") {
		if (!data.dstAddress && !data.dstHost) ctx.addIssue({ code: "custom", path: ["dstAddress"], message: "dstAddress or dstHost is required for an ip entry" });
		if (data.action && !IP_ACTIONS.includes(data.action)) ctx.addIssue({ code: "custom", path: ["action"], message: `action must be one of ${IP_ACTIONS.join(", ")}` });
		if (data.path) ctx.addIssue({ code: "custom", path: ["path"], message: "path only applies to host entries" });
	}
}

export const createWalledGardenSchema = entryBase.superRefine(refineEntry).transform((data) => ({
	...data,
	action: data.action ?? (data.kind === "ip" ? "accept" : "allow")
}));

export const updateWalledGardenSchema = entryBase.omit({ kind: true }).partial();

export const syncNetworkConfigSchema = z.object({
	routerId: z.string().min(1).optional(),
	resources: z.enum(["all", "profiles", "walled-garden"]).optional(),
	dryRun: z.boolean().optional()
});

export const importNetworkConfigSchema = z.object({
	routerId: z.string().min(1).optional(),
	resources: z.enum(["all", "profiles", "walled-garden"]).optional(),
	apply: z.boolean().optional()
});
