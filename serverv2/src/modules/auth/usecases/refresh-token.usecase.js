export class RefreshToken {
	constructor({userRepository, tokenService, auditService}) {
		this.userRepository = userRepository;
		this.tokenService = tokenService;
		this.auditService = auditService;
	}

	async execute({ refreshToken }) {
		if (!refreshToken) throw new Error("Refresh token required");

		let payload;
		try {
			payload = this.tokenService.verifyRefreshToken(refreshToken);
		} catch (err) {
			throw new Error("Invalid or expired refresh token");
		}

		// 🎯 Fix: Safely extract the ID from both new and old token styles
		const userId = payload.id || payload._id || payload.sub || payload.userId;
		
		// If the token is so old it doesn't even have a trackable ID, kick them out safely
		if (!userId) {
			throw new Error("Malformed legacy token session");
		}

		const user = await this.userRepository.findById(userId.toString());
		
		// 🚨 If it's an old test user that doesn't exist on production, catch it cleanly
		if (!user) {
			throw new Error("Session user no longer exists");
		}

		const plainUser = typeof user.toObject === "function" ? user.toObject() : JSON.parse(JSON.stringify(user));
		plainUser.id = plainUser._id ? plainUser._id.toString() : plainUser.id;
		plainUser._id = plainUser.id;

		const newAccessToken = this.tokenService.generateAccessToken(plainUser);
		const newRefreshToken = this.tokenService.generateRefreshToken(plainUser);

		if (this.auditService) {
			await this.auditService.log({
				actorId: user.id,
				action: "TOKEN_REFRESH",
				resource: "User",
				metadata: {}
			}).catch((err) => console.error("Audit log failed:", err.message));
		}

		return {
			accessToken: newAccessToken,
			refreshToken: newRefreshToken
		};
	}
}
