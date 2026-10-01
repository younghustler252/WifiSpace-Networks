export class LogoutUser {
	constructor({ tokenBlacklistService, tokenService, auditService }) {
		this.tokenBlacklistService = tokenBlacklistService;
		this.tokenService = tokenService;
		this.auditService = auditService;
	}

	async execute({ userId, accessToken, refreshToken }) {
		await this._revoke(accessToken);
		await this._revoke(refreshToken);

		if (this.auditService) {
			await this.auditService.log({
				actorId: userId,
				action: "LOGOUT",
				resource: "User",
				metadata: {}
			}).catch((err) => console.error("Audit log failed:", err.message));
		}

		return { message: "Logged out successfully" };
	}

	async _revoke(token) {
		if (!token || !this.tokenBlacklistService) return;

		const decoded = this.tokenService.decode(token);
		if (!decoded?.exp) return;

		const ttlSeconds = decoded.exp - Math.floor(Date.now() / 1000);
		if (ttlSeconds > 0) {
			await this.tokenBlacklistService.revoke(token, ttlSeconds);
		}
	}
}