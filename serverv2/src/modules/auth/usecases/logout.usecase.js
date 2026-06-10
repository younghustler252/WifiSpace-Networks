// modules/auth/usecases/logout.usecase.js
export class LogoutUser {
	constructor({tokenService, auditService}) {
		this.tokenService = tokenService; // handles token revocation / blacklist
		this.auditService = auditService; // optional audit logging
	}

	async execute({ userId, accessToken, refreshToken }) {
		// Revoke tokens
		if (this.tokenService) {
			if (accessToken) this.tokenService.revokeToken(accessToken);
			if (refreshToken) this.tokenService.revokeToken(refreshToken);
		}

		// Audit logout action
		if (this.auditService) {
			await this.auditService.log({
				actorId: userId,
				action: "LOGOUT",
				meta: {}
			});
		}

		return { message: "Logged out successfully" };
	}
}