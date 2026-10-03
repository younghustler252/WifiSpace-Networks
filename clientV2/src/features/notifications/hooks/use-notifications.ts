"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unwrap } from "@/lib/api/unwrap";
import { normalizeNotification } from "../lib/normalize-notification";
import type { NotificationsPage } from "../types/notifications.types";
import { adminNotificationsApi, notificationsApi } from "../services/notifications.api";
import { normalizeAdminNotification } from "../lib/normalize-admin-notifcation";


export const NOTIFICATIONS_KEY = ["notifications", "me"] as const;
export const ADMIN_NOTIFICATIONS_KEY = ["notifications", "admin"] as const;
const PAGE_SIZE = 15;

export function useNotifications(page: number) {
	return useQuery({
		queryKey: [...NOTIFICATIONS_KEY, page],
		queryFn: async (): Promise<NotificationsPage> => {
			const res = unwrap(await notificationsApi.listMine({ page, limit: PAGE_SIZE }));
			return { items: res.data.map(normalizeNotification), meta: res.meta };
		},
		placeholderData: keepPreviousData,
		refetchInterval: 60_000,
	});
}

export function useHasUnread() {
	const { data } = useNotifications(1);
	return !!data?.items.some((n) => !n.isRead);
}

export function useMarkNotificationRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => unwrap(await notificationsApi.markRead(id)),
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
			const previous = queryClient.getQueriesData<NotificationsPage>({ queryKey: NOTIFICATIONS_KEY });

			queryClient.setQueriesData<NotificationsPage>({ queryKey: NOTIFICATIONS_KEY }, (old) =>
				old
					? {
							...old,
							items: old.items.map((n) =>
								n.id === id ? { ...n, status: "READ", readAt: new Date().toISOString(), isRead: true } : n
							),
						}
					: old
			);

			return { previous };
		},
		onError: (_error, _id, context) => {
			context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
	});
}


export function useAdminNotifications(page: number) {
	return useQuery({
		queryKey: [...ADMIN_NOTIFICATIONS_KEY, page],
		queryFn: async () => {
			const res = unwrap(await adminNotificationsApi.list({ page, limit: 12 }));
			return { items: res.data.map(normalizeAdminNotification), meta: res.meta };
		},
		placeholderData: keepPreviousData,
	});
}

export function useSendNotification() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: adminNotificationsApi.create,
		onSuccess: (res) => {
			if (res.success) queryClient.invalidateQueries({ queryKey: ADMIN_NOTIFICATIONS_KEY });
		},
	});
}