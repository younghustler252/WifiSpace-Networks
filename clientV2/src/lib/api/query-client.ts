import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./unwrap";

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30_000,
				refetchOnWindowFocus: false,
				retry: (count, error) => {
					if (error instanceof ApiError && error.code !== "NETWORK_ERROR") return false;
					return count < 2;
				},
			},
		},
	});
}