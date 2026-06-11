import { ValidationError } from "../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";

export class VerifyOtp {
	constructor({userRepository, auditService, tokenService, passwordService}) {
		this.userRepository = userRepository;
		this.auditService = auditService;
		this.tokenService = tokenService;
		this.passwordService = passwordService;
	}

	async execute({ email, otp, ip = null }) {
		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			throw new NotFoundError("User not found");
		}

		if (user.isVerified) {
			throw new ValidationError("User already verified");
		}
		if (!user.verificationOTP) {
			throw new ValidationError("No OTP set. Please request a new one.");
		}


		const isValid = await this.passwordService.compare(otp.toString(), user.verificationOTP);

		if (!isValid) {
			throw new ValidationError("Invalid OTP");
		}

		if (Date.now() > user.otpExpiresAt) {
			throw new ValidationError("OTP expired");
		}

		user.verify();

		await this.userRepository.update(user.id, {
			isVerified: true,
			verificationOTP: null,
			otpExpiresAt: null
		});

		const payload = {
  sub: user.id,
  email: user.email,
  role: user.role
};

const accessToken = this.tokenService.generateAccessToken(payload);
const refreshToken = this.tokenService.generateRefreshToken(payload);
		if (this.auditService) {
			await this.auditService.log({
				actorId: user.id,
				action: "USER_VERIFIED",
				meta: { ip }
			});
		}

		return {                     
			
			user: {
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
				isVerified: true
			},
			accessToken,
			refreshToken
		};
	}
}