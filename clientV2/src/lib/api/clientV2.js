import axios from "axios";

// ================================
// BASE CONFIG
// ================================

const BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

// ================================
// AXIOS INSTANCE
// ================================

export const API = axios.create({
	baseURL: BASE_URL,
	withCredentials: true, 
});


API.interceptors.response.use(
	(response) => {
		// return only data (cleaner)
		return response.data;
	},

	async (error) => {
		const originalRequest = error.config;
		const status = error.response?.status;

		// ================================
		// HANDLE TOKEN EXPIRY (401)
		// ================================

		if (status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				
				await API.post("/auth/refresh");

				return API(originalRequest);
			} catch (refreshError) {
				// ================================
				// REFRESH FAILED → LOGOUT FLOW
				// ================================

				if (typeof window !== "undefined") {
					window.location.href = "/login";
				}

				return Promise.reject(refreshError);
			}
		}

		// ================================
		// NORMALIZE BACKEND ERRORS
		// ================================

		if (error.response?.data) {
			return Promise.reject({
				message:
					error.response.data.message || "Something went wrong",
				code:
					error.response.data.code || "UNKNOWN_ERROR",
				details:
					error.response.data.details || null,
				status,
			});
		}

		// ================================
		// NETWORK / UNKNOWN ERROR
		// ================================

		return Promise.reject({
			message: error.message || "Network error",
			code: "NETWORK_ERROR",
			status,
		});
	}
);