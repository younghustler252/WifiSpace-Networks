const isProd = process.env.NODE_ENV === "production";

const baseOptions = {
	httpOnly: true,
	secure: isProd,
	sameSite: isProd ? "strict" : "lax"
};

export function setAuthCookies(res, { accessToken, refreshToken }) {
	res.cookie("accessToken", accessToken, { ...baseOptions, maxAge: 15 * 60 * 1000 });
	res.cookie("refreshToken", refreshToken, { ...baseOptions, maxAge: 7 * 24 * 60 * 60 * 1000, path: "/api/auth/refresh" });
}

export function clearAuthCookies(res) {
	res.clearCookie("accessToken", baseOptions);
	res.clearCookie("refreshToken", { ...baseOptions, path: "/api/auth/refresh" });
}