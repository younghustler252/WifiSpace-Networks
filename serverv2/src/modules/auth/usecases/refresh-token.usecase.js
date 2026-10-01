import { ValidationError, UnauthorizedError } from "../../../shared/errors/domain.errors.js";
import { ERROR_CODES } from "../../../shared/errors/domain.errors.js";

export class RefreshToken {
	constructor({ userRepository, tokenService, auditService }) {
		this.userRepository = userRepository;
		this.tokenService = tokenService;
		this.auditService = auditService;
	}

	async execute({ refreshToken }) {
		if (!refreshToken) {
			throw new ValidationError("Refresh token is required", ERROR_CODES.REFRESH_TOKEN_REQUIRED);
		}

		const payload = this.tokenService.verifyRefreshToken(refreshToken);

		if (!payload.sub) {
			throw new UnauthorizedError("Malformed refresh token", ERROR_CODES.REFRESH_TOKEN_MALFORMED);
		}

		const user = await this.userRepository.findById(payload.sub);
		if (!user) {
			throw new UnauthorizedError("Session user no longer exists", ERROR_CODES.SESSION_USER_NOT_FOUND);
		}

		const accessToken = this.tokenService.generateAccessToken(user);
		const newRefreshToken = this.tokenService.generateRefreshToken(user);

		if (this.auditService) {
			await this.auditService.log({
				actorId: user.id,
				action: "TOKEN_REFRESH",
				resource: "User",
				metadata: {}
			}).catch((err) => console.error("Audit log failed:", err.message));
		}

		return { accessToken, refreshToken: newRefreshToken };
	}
}