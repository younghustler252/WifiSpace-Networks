import crypto from "crypto";
import { ConflictError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../../user/domain/user.enum.js";
import { USER_ROLE, USER_STATUS } from "../../../user/domain/user.enum.js";
import { User } from "../../../user/domain/user.entity.js";
import { HotspotAccount } from "../../../account/domain/hotspot-account.entity.js";
import { APPROVAL_STATUSES } from "../../../account/domain/account.enum.js";

export class RegisterHotspotUser {
	constructor({ userRepository, accountRepository, passwordService }) {
		this.userRepository = userRepository;
		this.accountRepository = accountRepository;
		this.passwordService = passwordService;
	}

	async execute({ firstName = "Guest", lastName = "User", email, phone = null }) {
		const existing = await this.userRepository.findByEmail(email);
		if (existing) throw new ConflictError("Email already registered", USER_ERROR_CODES.EMAIL_ALREADY_IN_USE);

		const randomPassword = crypto.randomBytes(16).toString("hex");
		const hashedPassword = await this.passwordService.hash(randomPassword);

		const user = new User({
			firstName, lastName, email, hashedPassword, phone,
			role: USER_ROLE.CUSTOMER, status: USER_STATUS.ACTIVE, isVerified: true // hotspot signup skips OTP — email isn't the trust anchor here, payment is
		});

		const createdUser = await this.userRepository.create(user);

		const account = new HotspotAccount({ userId: createdUser.id, approvalStatus: APPROVAL_STATUSES.APPROVED });
		await this.accountRepository.create(account);

		return createdUser;
	}
}