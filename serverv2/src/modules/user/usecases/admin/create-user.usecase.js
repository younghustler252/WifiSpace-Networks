import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { User } from "../../domain/user.entity.js";

export class CreateUser {
	constructor(
		userRepository,
		passwordService,
		auditService,
		analyticsTracker // ✅ ADD THIS
	) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.auditService = auditService;
		this.analyticsTracker = analyticsTracker; // ✅
	}

	async execute(actor, userData) {

		// ----------------------------
		// 2️⃣ Validation
		// ----------------------------
		const { firstName, lastName, email, password, role = "customer" } = userData;

		if (!firstName) throw new ValidationError("First name is required");
		if (!lastName) throw new ValidationError("Last name is required");
		if (!email) throw new ValidationError("Email is required");
		if (!password) throw new ValidationError("Password is required");

		// ----------------------------
		// 3️⃣ Duplicate check
		// ----------------------------
		const existing = await this.userRepository.findByEmail(email);
		if (existing) throw new ValidationError("Email already in use");

		// ----------------------------
		// 4️⃣ Hash password
		// ----------------------------
		const hashedPassword = await this.passwordService.hash(password);

		// ----------------------------
		// 5️⃣ Create entity
		// ----------------------------
		const userEntity = new User({
			firstName,
			lastName,
			email,
			hashedPassword,
			role,
			status: "active",
			isVerified: false
		});

		// ----------------------------
		// 6️⃣ Save user
		// ----------------------------
		const createdUser = await this.userRepository.create(userEntity);

		// ----------------------------
		// 7️⃣ Audit log
		// ----------------------------
		if (this.auditService) {
			await this.auditService.log({
				actorId: actor.id,
				action: "CREATE_USER",
				targetId: createdUser.id,
				meta: {
					role: createdUser.role,
					email: createdUser.email
				}
			});
		}

		// ----------------------------
		// 8️⃣ ANALYTICS TRACKING (IMPORTANT)
		// ----------------------------
		try {
			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.USER_CREATED,
				{
					role: createdUser.role
				}
			);
		} catch (err) {
			console.error("Analytics tracking failed", {
				event: ANALYTICS_EVENTS.USER_CREATED,
				error: err.message
			});
		}
		// ----------------------------
		// 9️⃣ Return result
		// ----------------------------
		return createdUser;
	}
}