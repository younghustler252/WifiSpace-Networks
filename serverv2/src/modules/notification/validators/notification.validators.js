// modules/notifications/validators/notification.validators.js
import { z } from "zod";
import { NOTIFICATION_TYPE_LIST, NOTIFICATION_CHANNEL_LIST, NOTIFICATION_PRIORITY_LIST } from "../domain/notification.enum.js";

export const createNotificationSchema = z.object({
	type: z.enum(NOTIFICATION_TYPE_LIST),
	title: z.string().min(1),
	message: z.string().min(1),
	userIds: z.array(z.string().min(1)).min(1),
	channel: z.enum(NOTIFICATION_CHANNEL_LIST).optional(),
	priority: z.enum(NOTIFICATION_PRIORITY_LIST).optional(),
	accountId: z.string().optional()
});