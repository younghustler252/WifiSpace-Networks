import { ValidationError } from "../../../shared/errors/validation-error.js";
import { User } from "../../user/domain/user.entity.js";

export class RegisterHotspotUser {

	constructor({
		userRepository,
		passwordService,
		auditService,
		mailService
	}) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.auditService = auditService;
		this.mailService = mailService;
	}

	async execute({ firstName, lastName, email, phone }) {
		if (!firstName) throw new ValidationError("First name is required");
		if (!lastName) throw new ValidationError("Last name is required");
		if (!email) throw new ValidationError("Email is required");
		if (!phone) throw new ValidationError("Phone is required");

		const normalizedEmail = email.toLowerCase().trim();

		const existingUser = await this.userRepository.findByEmail(normalizedEmail);
		if (existingUser) {
			throw new ValidationError(
				"An account already exists with this email. Please sign in to continue."
			);
		}

		const hashedPassword = await this.passwordService.hash(phone);

		const userEntity = new User({
			firstName,
			lastName,
			email: normalizedEmail,
			phone,
			hashedPassword,
			role: "customer",
			status: "active",
			isVerified: true,
			permissions: []
		});

		const user = await this.userRepository.create(userEntity);

		// CHANGED: this was the bug — an unhandled email-send failure was
		// propagating all the way up and turning a successful account
		// creation into a 500 that killed the entire purchase. A welcome
		// email is a side effect, not something the critical path (account
		// exists, customer can pay and get online) should ever depend on.
		// Brevo's IP-whitelist rejection here is an operational config
		// issue, unrelated to whether registration itself succeeded.
		try {
			await this.mailService.sendNotification({
				to: normalizedEmail,
				name: firstName,
				subject: "Your WiFiSpace account has been created",
				message: `
					Welcome ${firstName}.

					Your account has been created successfully.

					Login email:
					${normalizedEmail}

					Your temporary password is your phone number.

					Please login and change your password after accessing your account.
				`
			});
		} catch (mailError) {
			console.error(
				`[RegisterHotspotUser] Failed to send welcome email to ${normalizedEmail}:`,
				mailError.message
			);
			// Deliberately not re-thrown — registration already succeeded.
		}

		try {
			await this.auditService.log({
				actorId: user.id,
				action: "HOTSPOT_AUTO_REGISTER",
				resource: "User",
				metadata: { email: normalizedEmail, method: "HOTSPOT_PORTAL" }
			});
		} catch (auditError) {
			// Same principle — audit logging shouldn't be able to block
			// registration either.
			console.error(`[RegisterHotspotUser] Audit log failed for ${normalizedEmail}:`, auditError.message);
		}

		return user;
	}
}