import SavedCardModel from "../database/saved-card.model.js";

const present = (doc) => doc && ({
	id: String(doc._id),
	userId: String(doc.userId),
	last4: doc.last4,
	brand: doc.brand,
	bank: doc.bank,
	cardType: doc.cardType,
	expMonth: doc.expMonth,
	expYear: doc.expYear,
	isDefault: doc.isDefault,
	expired: isExpired(doc),
	lastUsedAt: doc.lastUsedAt,
	createdAt: doc.createdAt
});

function isExpired(doc) {
	const month = Number(doc.expMonth);
	const year = Number(doc.expYear);
	if (!month || !year) return false;
	const end = new Date(year, month, 1);
	return end <= new Date();
}

export class SavedCardRepositoryMongo {
	constructor() {
		this.model = SavedCardModel;
	}

	async upsertFromAuthorization(userId, authorization, email) {
		if (!authorization?.reusable || !authorization.authorization_code || !authorization.signature || !authorization.last4) return null;
		if (authorization.channel && authorization.channel !== "card") return null;

		const hasDefault = await this.model.exists({ userId, isDefault: true });

		const doc = await this.model.findOneAndUpdate(
			{ userId, signature: authorization.signature },
			{
				$set: {
					authorizationCode: authorization.authorization_code,
					email: String(email).toLowerCase(),
					last4: authorization.last4,
					brand: authorization.brand ?? null,
					bank: authorization.bank ?? null,
					cardType: authorization.card_type ?? null,
					expMonth: authorization.exp_month ?? null,
					expYear: authorization.exp_year ?? null
				},
				$setOnInsert: { isDefault: !hasDefault }
			},
			{ upsert: true, new: true }
		).lean();

		return present(doc);
	}

	async listByUser(userId) {
		const docs = await this.model.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
		return docs.map(present);
	}

	async findForCharge(id, userId) {
		const doc = await this.model.findOne({ _id: id, userId }).select("+authorizationCode").lean();
		if (!doc) return null;
		return { ...present(doc), authorizationCode: doc.authorizationCode, email: doc.email };
	}

	async findDefaultForCharge(userId) {
		const doc = await this.model.findOne({ userId }).sort({ isDefault: -1, createdAt: -1 }).select("+authorizationCode").lean();
		if (!doc) return null;
		return { ...present(doc), authorizationCode: doc.authorizationCode, email: doc.email };
	}

	async setDefault(id, userId) {
		const target = await this.model.findOne({ _id: id, userId }).lean();
		if (!target) return null;
		await this.model.updateMany({ userId }, { $set: { isDefault: false } });
		await this.model.updateOne({ _id: id }, { $set: { isDefault: true } });
		return present({ ...target, isDefault: true });
	}

	async remove(id, userId) {
		const doc = await this.model.findOneAndDelete({ _id: id, userId }).lean();
		if (!doc) return null;
		if (doc.isDefault) {
			const next = await this.model.findOne({ userId }).sort({ createdAt: -1 });
			if (next) await this.model.updateOne({ _id: next._id }, { $set: { isDefault: true } });
		}
		return present(doc);
	}

	async touch(id) {
		await this.model.updateOne({ _id: id }, { $set: { lastUsedAt: new Date() } });
	}
}
