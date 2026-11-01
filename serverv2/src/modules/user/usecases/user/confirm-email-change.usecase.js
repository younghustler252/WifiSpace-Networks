import { NotFoundError, ValidationError, ConflictError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../domain/user.enum.js";

const MAX_ATTEMPTS = 5;

export class ConfirmEmailChange {
	constructor({ userRepository, passwordService, mailService, auditService }) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.mailService = mailService;
		this.auditService = auditService;
	}

	async execute({ userId, otp, ip = null }) {
		const state = await this.userRepository.getEmailChangeState(userId);
		if (!state) throw new NotFoundError("User not found", USER_ERROR_CODES.USER_NOT_FOUND);
		if (!state.pendingEmail || !state.otpHash) {
			throw new ValidationError("There is no pending email change. Request a new code.", "EMAIL_CHANGE_NOT_REQUESTED");
		}
		if (!state.expiresAt || state.expiresAt < Date.now()) {
			await this.userRepository.clearPendingEmailChange(userId);
			throw new ValidationError("This code has expired. Request a new one.", "OTP_EXPIRED");
		}
		if (state.attempts >= MAX_ATTEMPTS) {
			await this.userRepository.clearPendingEmailChange(userId);
			throw new ValidationError("Too many wrong attempts. Request a new code.", "OTP_LOCKED");
		}

		const valid = await this.passwordService.compare(String(otp), state.otpHash);
		if (!valid) {
			await this.userRepository.bumpEmailChangeAttempts(userId);
			throw new ValidationError("That code is not correct", "OTP_INVALID");
		}

		if (await this.userRepository.emailTaken(state.pendingEmail, userId)) {
			await this.userRepository.clearPendingEmailChange(userId);
			throw new ConflictError("Email already in use", USER_ERROR_CODES.EMAIL_ALREADY_IN_USE);
		}

		const previous = state.email;
		await this.userRepository.commitEmailChange(userId, state.pendingEmail);

		await this.auditService?.log({
			actorId: userId, action: "EMAIL_CHANGED", resource: "User", metadata: { previous, next: state.pendingEmail, ip }
		}).catch((err) => console.error("Audit log failed:", err.message));

		this.mailService?.sendNotification({
			to: previous, name: state.firstName, title: "Your email address was changed",
			message: `The email address on your account was changed to ${state.pendingEmail}. If you did not do this, please contact our support team right away.`
		}).catch((err) => console.error("[ConfirmEmailChange] Notice failed:", err.message));

		return this.userRepository.findById(userId);
	}
}
