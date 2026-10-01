// login.usecase.js
import { UnauthorizedError, ForbiddenError } from "../../../shared/errors/domain.errors.js";
import { AUTH_ERROR_CODES } from "../domain/auth.enum.js";

export class LoginUser {
	constructor({ userRepository, passwordService, tokenService, auditService }) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.tokenService = tokenService;
		this.auditService = auditService;
	}

	async execute({ email, password, ip = null, userAgent = null }) {
		const user = await this.userRepository.findAuthByEmail(email);

		if (!user) throw new UnauthorizedError("Invalid credentials", AUTH_ERROR_CODES.INVALID_CREDENTIALS);
		if (!user.isActive()) throw new ForbiddenError("Account is not active", AUTH_ERROR_CODES.ACCOUNT_INACTIVE);
		if (user.isLocked()) throw new ForbiddenError("Account temporarily locked", AUTH_ERROR_CODES.ACCOUNT_LOCKED);

		const isValid = await this.passwordService.compare(password, user.hashedPassword);

		if (!isValid) {
			user.recordFailedLogin();
			await this.userRepository.updateSecurityState(user.id, {
				failedLoginAttempts: user.failedLoginAttempts,
				lockUntil: user.lockUntil
			});
			if (this.auditService) {
				await this.auditService.log({
					actorId: user.id, action: "LOGIN_FAILED", resource: "User",
					metadata: { reason: "INVALID_PASSWORD", ip, userAgent }
				}).catch((e) => console.error("Audit log failed:", e.message));
			}
			throw new UnauthorizedError("Invalid credentials", AUTH_ERROR_CODES.INVALID_CREDENTIALS);
		}

		if (!user.isVerified) {
			throw new ForbiddenError("Account not verified. Please verify your email.", AUTH_ERROR_CODES.ACCOUNT_NOT_VERIFIED, {
				email: user.email, otpExpiresAt: user.otpExpiresAt
			});
		}

		user.resetLoginAttempts();
		await this.userRepository.updateSecurityState(user.id, {
			failedLoginAttempts: 0, lockUntil: null, lastLoginAt: user.lastLoginAt
		});

		const accessToken = this.tokenService.generateAccessToken(user);
		const refreshToken = this.tokenService.generateRefreshToken(user);

		if (this.auditService) {
			await this.auditService.log({
				actorId: user.id, action: "LOGIN_SUCCESS", resource: "User", metadata: { ip, userAgent }
			}).catch((e) => console.error("Audit log failed:", e.message));
		}

		return { accessToken, refreshToken, user };
	}
}