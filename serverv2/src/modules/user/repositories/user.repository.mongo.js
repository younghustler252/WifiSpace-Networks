import UserModel from "../database/user.model.js";
import { UserMapper } from "../domain/user-mapper.js";
import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";

const AUTH_FIELDS = "+password +verificationOTP +otpExpiresAt +otpAttempts +otpLockedUntil +failedLoginAttempts +lockUntil +resetPasswordOTP +resetPasswordOTPExpiresAt +resetPasswordAttempts +resetPasswordOTPLockedUntil +lastResetPasswordOtpSentAt";

export class UserRepositoryMongo extends BaseRepository {
	constructor() {
		super(UserModel, UserMapper);
	}

	async findByEmail(email, opts = {}) {
		return this.findOne({ filter: { email }, lean: false, ...opts });
	}

	async findAuthByEmail(email) {
		const doc = await this.model.findOne({ email }).select(AUTH_FIELDS);
		return this.mapOne(doc);
	}

	async findAuthById(id) {
		if (!this.isValidId(id)) return null;
		const doc = await this.model.findById(id).select(AUTH_FIELDS);
		return this.mapOne(doc);
	}

	async emailTaken(email, exceptId = null) {
		const filter = { email: String(email).toLowerCase().trim() };
		if (exceptId && this.isValidId(exceptId)) filter._id = { $ne: exceptId };
		return Boolean(await this.model.exists(filter));
	}

	async setPendingEmailChange(id, { pendingEmail, otpHash, expiresAt, sentAt }) {
		if (!this.isValidId(id)) return null;
		await this.model.updateOne({ _id: id }, {
			$set: {
				pendingEmail: String(pendingEmail).toLowerCase().trim(),
				emailChangeOTP: otpHash,
				emailChangeOTPExpiresAt: expiresAt,
				emailChangeAttempts: 0,
				lastEmailChangeOtpSentAt: sentAt
			}
		});
	}

	async getEmailChangeState(id) {
		if (!this.isValidId(id)) return null;
		const doc = await this.model.findById(id)
			.select("+emailChangeOTP +emailChangeOTPExpiresAt +emailChangeAttempts pendingEmail lastEmailChangeOtpSentAt email firstName lastName")
			.lean();
		if (!doc) return null;
		return {
			id: String(doc._id),
			email: doc.email,
			firstName: doc.firstName,
			pendingEmail: doc.pendingEmail ?? null,
			otpHash: doc.emailChangeOTP ?? null,
			expiresAt: doc.emailChangeOTPExpiresAt ?? null,
			attempts: doc.emailChangeAttempts ?? 0,
			lastSentAt: doc.lastEmailChangeOtpSentAt ?? null
		};
	}

	async bumpEmailChangeAttempts(id) {
		const doc = await this.model.findByIdAndUpdate(id, { $inc: { emailChangeAttempts: 1 } }, { new: true }).select("+emailChangeAttempts").lean();
		return doc?.emailChangeAttempts ?? 0;
	}

	async clearPendingEmailChange(id) {
		await this.model.updateOne({ _id: id }, {
			$set: { pendingEmail: null, emailChangeOTP: null, emailChangeOTPExpiresAt: null, emailChangeAttempts: 0 }
		});
	}

	async commitEmailChange(id, email) {
		await this.model.updateOne({ _id: id }, {
			$set: {
				email: String(email).toLowerCase().trim(),
				isVerified: true,
				pendingEmail: null,
				emailChangeOTP: null,
				emailChangeOTPExpiresAt: null,
				emailChangeAttempts: 0
			}
		});
	}

	async updatePhone(id, phone) {
		if (!this.isValidId(id)) return null;
		await this.model.updateOne({ _id: id }, { $set: { phone } });
	}

	async updateSecurityState(id, data) {
		if (!this.isValidId(id)) return null;
		await this.model.findByIdAndUpdate(id, UserMapper.toPersistence(data), { new: true });
	}

	async countActiveUsers() {
		return this.count({ status: "active" });
	}

	async getDashboardStats() {
		const [stats] = await this.model.aggregate([
			{
				$group: {
					_id: null,
					total: { $sum: 1 },
					customers: { $sum: { $cond: [{ $eq: ["$role", "customer"] }, 1, 0] } },
					staff: { $sum: { $cond: [{ $eq: ["$role", "staff"] }, 1, 0] } },
					superadmins: { $sum: { $cond: [{ $eq: ["$role", "superadmin"] }, 1, 0] } },
					active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
					suspended: { $sum: { $cond: [{ $eq: ["$status", "suspended"] }, 1, 0] } },
					banned: { $sum: { $cond: [{ $eq: ["$status", "banned"] }, 1, 0] } }
				}
			}
		]);

		return stats;
	}
}