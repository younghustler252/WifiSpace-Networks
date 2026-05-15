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

API.interceptors.response.use(
	(response) => {
		// return backend structured response
		return response.data;
	},

	async (error: AxiosError): Promise<unknown> => {
		const originalRequest = error.config as CustomAxiosRequestConfig;
		const status = error.response?.status;

		// ================================
		// HANDLE TOKEN EXPIRY (401)
		// ================================

		if (status === 401 && originalRequest && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const refreshToken = getRefreshToken();

				if (!refreshToken) {
					throw new Error("No refresh token");
				}

						// Call refresh endpoint with proper payload
				const resData = await authApi.refresh(refreshToken) as ApiResponse<{
					accessToken: string;
					refreshToken?: string;
				}>;
				
				const newAccessToken = resData.data.accessToken;

				if (!newAccessToken) {
					throw new Error("Invalid refresh response");
				}

				// save new tokens
				setAccessToken(newAccessToken);

				if (resData.data.refreshToken) {
					setRefreshToken(resData.data.refreshToken);
				}

				// retry original request
				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
				}

				return API(originalRequest);
			} catch (refreshError) {
				// clear auth (AuthContext will handle redirect)
				clearAuthStorage();
				return Promise.reject(refreshError);
			}
		}

		// ================================
		// HANDLE BACKEND ERRORS
		// ================================

		if (error.response?.data) {
			const data = error.response.data as Partial<ApiResponse>;

			return Promise.reject<ApiError>({
				message: data.message || "Something went wrong",
				code: data.code || "UNKNOWN_ERROR",
				details: data.data || null,
				status,
			});
		}

		// ================================
		// NETWORK ERROR
		// ================================

		return Promise.reject<ApiError>({
			message: error.message || "Network error",
			code: "NETWORK_ERROR",
			status,
		});
	}
);