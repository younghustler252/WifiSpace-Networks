import { NotFoundError, ValidationError, ConflictError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../domain/user.enum.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

export class RequestEmailChange {
	constructor({ userRepository, passwordService, mailService, auditService }) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.mailService = mailService;
		this.auditService = auditService;
	}

	async execute({ userId, newEmail, password, ip = null }) {
		const user = await this.userRepository.findAuthById(userId);
		if (!user) throw new NotFoundError("User not found", USER_ERROR_CODES.USER_NOT_FOUND);

		const validPassword = await this.passwordService.compare(password, user.hashedPassword);
		if (!validPassword) throw new ValidationError("Password is incorrect", USER_ERROR_CODES.INVALID_OLD_PASSWORD);

		const next = String(newEmail).trim().toLowerCase();
		if (next === user.email) throw new ValidationError("That is already your email address", "EMAIL_UNCHANGED");
		if (await this.userRepository.emailTaken(next, user.id)) {
			throw new ConflictError("Email already in use", USER_ERROR_CODES.EMAIL_ALREADY_IN_USE);
		}

		const state = await this.userRepository.getEmailChangeState(user.id);
		if (state?.lastSentAt && Date.now() - state.lastSentAt < RESEND_COOLDOWN_MS) {
			throw new ValidationError("Please wait before requesting another code", "RESEND_COOLDOWN_ACTIVE");
		}

		const otp = String(Math.floor(100000 + Math.random() * 900000));
		const sentAt = Date.now();

		await this.userRepository.setPendingEmailChange(user.id, {
			pendingEmail: next,
			otpHash: await this.passwordService.hash(otp),
			expiresAt: sentAt + OTP_TTL_MS,
			sentAt
		});

		await this.mailService.sendEmailChangeOTP({ to: next, name: user.firstName, otp, expiresIn: 10 });

		await this.auditService?.log({
			actorId: user.id, action: "EMAIL_CHANGE_REQUESTED", resource: "User", metadata: { next, ip }
		}).catch((err) => console.error("Audit log failed:", err.message));

		return { pendingEmail: next, expiresAt: new Date(sentAt + OTP_TTL_MS), resendAfter: new Date(sentAt + RESEND_COOLDOWN_MS) };
	}
}
