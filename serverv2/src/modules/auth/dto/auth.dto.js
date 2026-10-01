export function toAuthResponse(user, tokens = {}) {
	return {
		user: user.toJSON(),
		accessToken: tokens.accessToken ?? null,
		refreshToken: tokens.refreshToken ?? null
	};
}