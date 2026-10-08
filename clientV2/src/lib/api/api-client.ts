import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { ApiErrorResponse, ApiResponse } from "@/types/api-response";
import { ERROR_CODES} from "@/types/error-codes";
import { COMMON_ERROR_MESSAGES } from "./common-error";
import { getApiBaseUrl } from "./get-api-base-url";

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const REQUEST_TIMEOUT_MS = 35_000;

const axiosInstance: AxiosInstance = axios.create({
	baseURL: getApiBaseUrl(),
	withCredentials: true,
	timeout: REQUEST_TIMEOUT_MS,
});

let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
	refreshPromise ??= axios
		.post<ApiResponse<unknown>>(`${getApiBaseUrl()}/auth/refresh`, {}, { withCredentials: true })
		.then((res) => res.data.success === true)
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
	async (error: AxiosError) => {
		const originalRequest = error.config as RetryableConfig | undefined;
		const isAuthRoute = originalRequest?.url?.startsWith("/auth/");

		if (error.response?.status === 401 && useAuthStore.getState().impersonation) {
			useAuthStore.getState().stopImpersonation();
			return Promise.reject(error);
		}

		if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
			originalRequest._retry = true;
			if (await refreshSession()) return axiosInstance(originalRequest);
			handleSessionExpired();
		}

		return Promise.reject(error);
	}
);

function isEnvelope(data: unknown): data is ApiResponse<unknown> {
	return !!data && typeof data === "object" && typeof (data as { success?: unknown }).success === "boolean";
}

function fallbackMessage(status?: number) {
	if (status && status >= 500) return "Something went wrong on our side.";
	if (status === 403) return "You don't have permission to do that.";
	if (status === 404) return "We couldn't find what you were looking for.";
	if (status === 429) return "Too many attempts. Please wait a moment and try again.";
	return "Something went wrong. Please try again.";
}

function failure(code: string, message: string, status?: number): ApiErrorResponse {
	return { success: false, code, message, details: null, status };
}

function failureFromError(error: AxiosError): ApiErrorResponse {
	const status = error.response?.status;
	const body = error.response?.data;

	if (isEnvelope(body) && !body.success) {
		const message = COMMON_ERROR_MESSAGES[body.code] ?? (body.message?.trim() || fallbackMessage(status));
		return { ...body, status, message };
	}

	if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT" || status === 408 || status === 504) {
		return failure(ERROR_CODES.TIMEOUT, "The server took too long to respond.", status);
	}

	if (!error.response) {
		return failure(ERROR_CODES.NETWORK_ERROR, "We couldn't reach the server. Check your connection.");
	}

	return failure(status && status >= 500 ? ERROR_CODES.SERVER_ERROR : ERROR_CODES.UNKNOWN, fallbackMessage(status), status);
}

async function request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
	try {
		const response = await axiosInstance.request<unknown>(config);
		if (isEnvelope(response.data)) return response.data as ApiResponse<T>;
		return { success: true, code: "SUCCESS", message: "", data: (response.data ?? null) as T };
	} catch (err) {
		return failureFromError(err as AxiosError);
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