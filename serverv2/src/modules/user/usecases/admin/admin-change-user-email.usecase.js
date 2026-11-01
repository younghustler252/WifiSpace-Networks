import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES, USER_ROLE } from "../../domain/user.enum.js";

export class AdminChangeUserEmail {
	constructor({ userRepository, auditService, mailService }) {
		this.userRepository = userRepository;
		this.auditService = auditService;
		this.mailService = mailService;
	}

	async execute({ actorId, actorRole, targetId, email, ip = null }) {
		const target = await this.userRepository.findById(targetId);
		if (!target) throw new NotFoundError("User not found", USER_ERROR_CODES.USER_NOT_FOUND);

		if (target.role === USER_ROLE.SUPERADMIN && actorRole !== USER_ROLE.SUPERADMIN) {
			throw new ForbiddenError("Only a superadmin can modify a superadmin", USER_ERROR_CODES.CANNOT_MODIFY_SUPERADMIN);
		}

		const next = String(email ?? "").trim().toLowerCase();
		const previous = target.email;

		if (next === previous) throw new ValidationError("That is already this user's email address", "EMAIL_UNCHANGED");
		if (await this.userRepository.emailTaken(next, target.id)) {
			throw new ConflictError("Email already in use", USER_ERROR_CODES.EMAIL_ALREADY_IN_USE);
		}

		await this.userRepository.commitEmailChange(target.id, next);

		await this.auditService?.log({
			actorId, action: "USER_EMAIL_CHANGED_BY_ADMIN", resource: "User",
			metadata: { targetId, previous, next, ip }
		}).catch((err) => console.error("Audit log failed:", err.message));

		const notice = (to, message) => this.mailService?.sendNotification({
			to, name: target.firstName, title: "Your email address was changed", message
		}).catch((err) => console.error("[AdminChangeUserEmail] Notice failed:", err.message));

		notice(next, `An administrator changed the email address on your account to ${next}. Use this address to sign in from now on.`);
		notice(previous, `An administrator changed the email address on your account from ${previous} to ${next}. If you did not expect this, please contact our support team.`);

		return this.userRepository.findById(target.id);
	}
}
