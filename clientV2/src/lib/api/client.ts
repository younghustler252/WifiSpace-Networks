import axios, {
	AxiosError,
	AxiosInstance,
	InternalAxiosRequestConfig,
} from "axios";

import { authApi } from "@/lib/api/auth";

// ================================
// BASE CONFIG
// ================================

const BASE_URL: string =
	process.env.NEXT_PUBLIC_API_BASE_URL ||
	"http://localhost:4000/api";

// ================================
// GLOBAL RESPONSE TYPE
// ================================

export interface ApiResponse<T = unknown> {
	success: boolean;
	code: string;
	message: string;
	data: T;
}

// ================================
// ERROR TYPE
// ================================

export interface ApiError {
	message: string;
	code?: string;
	details?: unknown;
	status?: number;
}

// ================================
// EXTEND AXIOS CONFIG
// ================================

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

// ================================
// AXIOS INSTANCE
// ================================

export const API: AxiosInstance = axios.create({
	baseURL: BASE_URL,
	withCredentials: false,
});

// ================================
// TOKEN HELPERS
// ================================

const getAccessToken = (): string | null =>
	typeof window !== "undefined"
		? localStorage.getItem("accessToken")
		: null;

const getRefreshToken = (): string | null =>
	typeof window !== "undefined"
		? localStorage.getItem("refreshToken")
		: null;

const setAccessToken = (token: string): void => {
	if (typeof window !== "undefined") {
		localStorage.setItem("accessToken", token);
	}
};

const setRefreshToken = (token: string): void => {
	if (typeof window !== "undefined") {
		localStorage.setItem("refreshToken", token);
	}
};

const clearAuthStorage = (): void => {
	if (typeof window !== "undefined") {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("user");
	}
};

// ================================
// REQUEST INTERCEPTOR
// ================================

API.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = getAccessToken();

		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error: AxiosError) => Promise.reject(error)
);

// ================================
// RESPONSE INTERCEPTOR
// ================================
const isAuthRoute = (url?: string) => {
	if (!url) return false;

	return (
		url.includes("/auth/")
	);
};

API.interceptors.response.use(
	(response) => {
		return response.data;
	},

	async (error: AxiosError): Promise<unknown> => {
		const originalRequest = error.config as CustomAxiosRequestConfig;
		const status = error.response?.status;
		const requestUrl = originalRequest?.url;

		// ================================
		// ❌ DO NOT AUTO-REFRESH AUTH ROUTES
		// ================================
		if (isAuthRoute(requestUrl)) {
			const data = error.response?.data as any;

			return Promise.reject({
				message: data?.message || "Auth error",
				code: data?.code || "AUTH_ERROR",
				status,
			});
		}

		// ================================
		// HANDLE TOKEN EXPIRY ONLY
		// ================================
		if (status === 401 && originalRequest && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const refreshToken = getRefreshToken();

				if (!refreshToken) {
					clearAuthStorage();
					return Promise.reject({
						message: "No refresh token. Please login again.",
						code: "NO_REFRESH_TOKEN",
					});
				}

				const resData = await authApi.refresh(refreshToken);

				const newAccessToken = resData.data.accessToken;

				if (!newAccessToken) {
					clearAuthStorage();
					return Promise.reject({
						message: "Invalid refresh response",
						code: "INVALID_REFRESH",
					});
				}

				setAccessToken(newAccessToken);

			

				if (resData?.data?.refreshToken) {
					setRefreshToken(resData.data.refreshToken);
				}

				if (originalRequest.headers) {
					originalRequest.headers.Authorization =
						`Bearer ${newAccessToken}`;
				}

				return API(originalRequest);
			} catch (refreshError) {
				clearAuthStorage();

				return Promise.reject({
					message: "Session expired. Please login again.",
					code: "SESSION_EXPIRED",
				});
			}
		}

		// ================================
		// NORMAL BACKEND ERRORS
		// ================================
		const data = error.response?.data as any;

		return Promise.reject({
			message: data?.message || error.message || "Something went wrong",
			code: data?.code || "UNKNOWN_ERROR",
			status,
			details: data,
		});
	}
);