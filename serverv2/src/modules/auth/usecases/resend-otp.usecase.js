import { ValidationError } from "../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";


export class ResendOtp {
	constructor({userRepository, mailService, passwordService}) {
		this.userRepository = userRepository;
		this.mailService = mailService;
		this.passwordService = passwordService;
	}

	async execute({ email }) {
		const user = await this.userRepository.findByEmail(email);
		if (!user) throw new NotFoundError("User not found");

		if (user.isVerified) {
			throw new ValidationError("User already verified");
		}

		const otp = Math.floor(100000 + Math.random() * 900000);
		const otpExpiresAt = Date.now() + 10 * 60 * 1000;

		const hashOtp = await this.passwordService.hash(otp.toString());

		await this.userRepository.update(user.id, {
			verificationOTP: hashOtp,
			otpExpiresAt
		});
		console.log("verification expires at", otpExpiresAt)
		// console.log("verification otp", hashOtp)

		await this.mailService.sendOTP({
			to: user.email,
			name: user.getFullName(),
			otp,
			expiresIn: 10
		});

		return { message: "OTP resent successfully" };
	}
}