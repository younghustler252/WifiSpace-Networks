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
// ⏳ RACE CONDITION PROOF QUEUE VARIABLES
// ================================
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

// ================================
// 🛡️ CAPTIVE PORTAL STORAGE CHECK
// ================================
const isStorageAvailable = (): boolean => {
	if (typeof window === "undefined") return false;
	try {
		// Checks if storage exists and is not nullified by restricted phone sandboxes
		return !!window.localStorage && window.localStorage !== null;
	} catch (e) {
		return false;
	}
};

// ================================
// TOKEN HELPERS (SAFE VERSION)
// ================================

const getAccessToken = (): string | null => {
	if (!isStorageAvailable()) return null;
	try {
		return localStorage.getItem("accessToken");
	} catch (e) {
		return null;
	}
};

const getRefreshToken = (): string | null => {
	if (!isStorageAvailable()) return null;
	try {
		return localStorage.getItem("refreshToken");
	} catch (e) {
		return null;
	}
};

const setAccessToken = (token: string): void => {
	if (!isStorageAvailable()) return;
	try {
		localStorage.setItem("accessToken", token);
	} catch (e) {
		console.warn("Storage write blocked by captive portal");
	}
};

const setRefreshToken = (token: string): void => {
	if (!isStorageAvailable()) return;
	try {
		localStorage.setItem("refreshToken", token);
	} catch (e) {
		console.warn("Storage write blocked by captive portal");
	}
};

const clearAuthStorage = (): void => {
	if (typeof window !== "undefined") {
		if (isStorageAvailable()) {
			try {
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				localStorage.removeItem("user");
			} catch (e) {
				console.warn("Storage clean skipped");
			}
		}
		// Redirecting to login with a clean query string parameter instead of a broken sub-page layout
		window.location.href = "/auth/login";
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
	return url.includes("/auth/");
};

API.interceptors.response.use(
	(response) => {
		// ✅ PRESERVED: Keeps your format intact across your entire codebase
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
			
			// 🛑 Catch subsequent parallel queries if refresh token task is active
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						if (originalRequest.headers) {
							// ✅ FIXED: Correct assignment format for newer Axios headers configuration block
							originalRequest.headers['Authorization'] = `Bearer ${token}`;
						}
						return API(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const refreshToken = getRefreshToken();

				if (!refreshToken) {
					clearAuthStorage();
					return Promise.reject({
						message: "No refresh token. Please login again.",
						code: "NO_REFRESH_TOKEN",
					});
				}

				// Fetch refresh payload
				const resData = await authApi.refresh(refreshToken);
				
				// ✅ FIXED: Safely unpacks token value whether resData is wrapped or raw data object
				const newAccessToken = resData?.data?.accessToken || (resData as any)?.accessToken;

				if (!newAccessToken) {
					clearAuthStorage();
					return Promise.reject({
						message: "Invalid refresh response",
						code: "INVALID_REFRESH",
					});
				}

				setAccessToken(newAccessToken);
				console.log("refresh", resData.data);

				const newRefreshToken = resData?.data?.refreshToken || (resData as any)?.refreshToken;
				if (newRefreshToken) {
					setRefreshToken(newRefreshToken);
				}

				if (originalRequest.headers) {
					// ✅ FIXED: Direct bracket notation update prevents silent auth drops on the retried request
					originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
				}

				// ✅ Flush queue variables & resolve pending queries
				processQueue(null, newAccessToken);
				isRefreshing = false;

				return API(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null);
				isRefreshing = false;
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
