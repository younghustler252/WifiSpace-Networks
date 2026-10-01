import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { ApiErrorResponse, ApiResponse } from "@/types/api-response";
import { useAuthStore } from "@/stores/auth.store";
import { getApiBaseUrl } from "./get-api-base-url";

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const axiosInstance: AxiosInstance = axios.create({
	baseURL: getApiBaseUrl(),
	headers: { "Content-Type": "application/json" },
	withCredentials: true,
});

let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
	refreshPromise ??= axios
		.post<ApiResponse<unknown>>(`${getApiBaseUrl()}/auth/refresh`, {}, { withCredentials: true })
		.then((res) => res.data.success)
		.catch(() => false)
		.finally(() => {
			refreshPromise = null;
		});
	return refreshPromise;
}
function handleSessionExpired() {
	useAuthStore.getState().clear();
}

axiosInstance.interceptors.request.use((config) => {
	const impersonation = useAuthStore.getState().impersonation;
	if (impersonation) config.headers.Authorization = `Bearer ${impersonation.token}`;
	return config;
});

axiosInstance.interceptors.response.use(
	(response) => response,
	async (error: AxiosError<ApiErrorResponse>) => {
		const originalRequest = error.config as RetryableConfig | undefined;
		const isAuthRoute = originalRequest?.url?.startsWith("/auth/");

		if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
			originalRequest._retry = true;
			if (await refreshSession()) return axiosInstance(originalRequest);
			handleSessionExpired();
		}

		return Promise.reject(error);
	}
);

async function request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
	try {
		const response = await axiosInstance.request<ApiResponse<T>>(config);
		return response.data;
	} catch (err) {
		const axiosErr = err as AxiosError<ApiErrorResponse>;
		if (axiosErr.response?.data) {
			return axiosErr.response.data;
		}
		return {
			success: false,
			code: "NETWORK_ERROR",
			message: axiosErr.message || "Network error",
			details: null,
		};
	}
}

export const API = {
	get: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: "GET", url }),
	post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>({ ...config, method: "POST", url, data }),
	put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>({ ...config, method: "PUT", url, data }),
	patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>({ ...config, method: "PATCH", url, data }),
	delete: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: "DELETE", url }),
	downloadFile: async (url: string, config?: AxiosRequestConfig): Promise<Blob> => {
		const response = await axiosInstance.request<Blob>({ ...config, method: "GET", url, responseType: "blob" });
		return response.data;
	},
};