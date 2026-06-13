import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { ForbiddenError } from "../../../shared/errors/forbidden-error.js";

export class LoginUser {
	constructor({userRepository, passwordService, tokenService, auditService}) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.tokenService = tokenService;
		this.auditService = auditService;
	}

	async execute({ email, password, ip = null, userAgent = null }) {
		const user = await this.userRepository.findAuthByEmail(email);
		
		if (!user) {
			throw new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS");
		}
		// console.log("user id", user.id)
		
		if (!user.isActive()) throw new ForbiddenError("Account is not active", "ACCOUNT_INACTIVE");
		if (user.isLocked()) throw new ForbiddenError("Account temporarily locked", "ACCOUNT_LOCKED");

		const isValid = await this.passwordService.compare(password, user.hashedPassword);
		if (!isValid) {
			user.recordFailedLogin();
			await this.userRepository.updateSecurityState(user.id, {
				failedLoginAttempts: user.failedLoginAttempts,
				lockUntil: user.lockUntil
			});
			if (this.auditService) {
				await this.auditService.log({
					actorId: user.id,
					action: "LOGIN_FAILED",
					resource: "User",
					metadata: { reason: "INVALID_PASSWORD", ip, userAgent }
				});
			}
			throw new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS");
		}

		if (!user.isVerified) {
			return {
				user: {
					id: user.id,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					role: user.role,
					isVerified: false,
					otpExpiresAt: user.otpExpiresAt 
				},
				accessToken: null,
				refreshToken: null,
				error: "ACCOUNT_NOT_VERIFIED"
			};
		}
		
		// if (this.auditService) {
		// 	await this.auditService.log({
		// 		actorId: null,
		// 		action: "LOGIN_FAILED",
		// 		resource: "User",
		// 		metadata: { email, reason: "USER_NOT_FOUND", ip, userAgent }
		// 	});
		// }
		// ✅ Reset failed attempts + last login
		user.resetLoginAttempts();
		await this.userRepository.updateSecurityState(user.id, {
			failedLoginAttempts: 0,
			lockUntil: null,
			lastLoginAt: user.lastLoginAt
		});

		// 🔑 Generate access & refresh tokens
		let accessToken, refreshToken;
		if (this.tokenService) {
			accessToken = this.tokenService.generateAccessToken({ sub: user.id, role: user.role });
			refreshToken = this.tokenService.generateRefreshToken({ sub: user.id });
		}

		// 📝 Audit successful login
		if (this.auditService) {
			await this.auditService.log({
				actorId: user.id,
				action: "LOGIN_SUCCESS",
				resource: "User",
				metadata: { ip, userAgent }
			});
		}

		return {
			accessToken,
			refreshToken,
			user
		};
	}
}