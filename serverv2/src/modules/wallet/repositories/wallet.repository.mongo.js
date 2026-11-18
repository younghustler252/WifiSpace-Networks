import mongoose from "mongoose";
import WalletModel from "../database/wallet.model.js";
import WalletTransactionModel from "../database/wallet-transaction.model.js";
import { ValidationError, ConflictError, AppError } from "../../../shared/errors/domain.errors.js";
import { WALLET_TX_TYPES, WALLET_ERROR_CODES } from "../domain/wallet.enum.js";

const toWallet = (doc) => doc && {
	id: doc._id.toString(),
	userId: doc.userId.toString(),
	balanceKobo: doc.balanceKobo,
	currency: doc.currency,
	virtualAccount: doc.virtualAccount?.accountNumber ? { ...doc.virtualAccount } : null,
	createdAt: doc.createdAt,
	updatedAt: doc.updatedAt
};

const toTransaction = (doc) => doc && {
	id: doc._id.toString(),
	walletId: doc.walletId.toString(),
	userId: doc.userId.toString(),
	type: doc.type,
	source: doc.source,
	amountKobo: doc.amountKobo,
	balanceAfterKobo: doc.balanceAfterKobo,
	reference: doc.reference,
	description: doc.description,
	metadata: doc.metadata,
	createdAt: doc.createdAt
};

const isDuplicateKey = (error) => error?.code === 11000;
const allowNonTransactional = () => String(process.env.WALLET_ALLOW_NON_TRANSACTIONAL ?? "true").toLowerCase() !== "false";
const lacksTransactions = (error) => /replica set|Transaction numbers are only allowed/i.test(error?.message ?? "");

export class WalletRepositoryMongo {
	constructor() {
		this.transactionsSupported = true;
	}

	async ensureWallet(userId) {
		try {
			const doc = await WalletModel.findOneAndUpdate(
				{ userId },
				{ $setOnInsert: { userId } },
				{ upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
			).lean();

			return toWallet(doc);
		} catch (error) {
			if (!isDuplicateKey(error)) throw error;
			return toWallet(await WalletModel.findOne({ userId }).lean());
		}
	}

	async findByUserId(userId) {
		return toWallet(await WalletModel.findOne({ userId }).lean());
	}

	async findByAccountNumber(accountNumber) {
		return toWallet(await WalletModel.findOne({ "virtualAccount.accountNumber": accountNumber }).lean());
	}

	async findByCustomerCode(customerCode) {
		return toWallet(await WalletModel.findOne({ "virtualAccount.customerCode": customerCode }).lean());
	}

	async claimVirtualAccountCreation(userId, lockMs = 60000) {
		const now = new Date();
		const doc = await WalletModel.findOneAndUpdate(
			{
				userId,
				$and: [
					{ $or: [{ "virtualAccount.accountNumber": null }, { "virtualAccount.accountNumber": { $exists: false } }] },
					{ $or: [{ virtualAccountLockAt: null }, { virtualAccountLockAt: { $exists: false } }, { virtualAccountLockAt: { $lt: new Date(now.getTime() - lockMs) } }] }
				]
			},
			{ $set: { virtualAccountLockAt: now } },
			{ returnDocument: "after" }
		).lean();

		return Boolean(doc);
	}

	async releaseVirtualAccountClaim(userId) {
		await WalletModel.updateOne({ userId }, { $set: { virtualAccountLockAt: null } });
	}

	async saveVirtualAccount(userId, virtualAccount) {
		const doc = await WalletModel.findOneAndUpdate(
			{ userId, $or: [{ "virtualAccount.accountNumber": null }, { "virtualAccount.accountNumber": { $exists: false } }] },
			{ $set: { virtualAccount: { ...virtualAccount, assignedAt: new Date() }, virtualAccountLockAt: null } },
			{ returnDocument: "after" }
		).lean();

		return toWallet(doc ?? (await WalletModel.findOne({ userId }).lean()));
	}

	async listVirtualAccountNumbers() {
		const docs = await WalletModel.find({ "virtualAccount.accountNumber": { $ne: null } }).select("virtualAccount.accountNumber").lean();
		return docs.map((doc) => doc.virtualAccount.accountNumber);
	}

	async findTransactionByReference(reference) {
		return toTransaction(await WalletTransactionModel.findOne({ reference }).lean());
	}

	async listTransactions(userId, { page = 1, limit = 20 } = {}) {
		const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
		const safePage = Math.max(parseInt(page, 10) || 1, 1);
		const filter = { userId };

		const [docs, total] = await Promise.all([
			WalletTransactionModel.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
			WalletTransactionModel.countDocuments(filter)
		]);

		return { data: docs.map(toTransaction), meta: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } };
	}

	async apply({ userId, type, amountKobo, source, reference, description = null, metadata = {} }) {
		if (!Number.isInteger(amountKobo) || amountKobo <= 0) throw new ValidationError("Amount must be a positive whole number of kobo");

		const existing = await this.findTransactionByReference(reference);
		if (existing) return this._duplicateResult(existing, { userId, type, amountKobo, source, reference });

		await this.ensureWallet(userId);
		const entry = { userId, type, amountKobo, source, reference, description, metadata };

		try {
			if (this.transactionsSupported) return await this._applyInTransaction(entry);
			return await this._applyWithoutTransaction(entry);
		} catch (error) {
			if (isDuplicateKey(error)) {
				const transaction = await this.findTransactionByReference(reference);
				if (transaction) return this._duplicateResult(transaction, entry);
			}

			if (this.transactionsSupported && lacksTransactions(error)) {
				if (!allowNonTransactional()) {
					console.error("[wallet] MongoDB transactions are unavailable and WALLET_ALLOW_NON_TRANSACTIONAL=false. Refusing wallet write.");
					throw new AppError("Wallet is temporarily unavailable. Please try again later.", 503, "WALLET_UNAVAILABLE");
				}
				this.transactionsSupported = false;
				console.error("[wallet] ALERT: MongoDB has no replica set, falling back to non-transactional wallet writes. Set WALLET_ALLOW_NON_TRANSACTIONAL=false once a replica set is in place.");
				return this._applyWithoutTransaction(entry);
			}

			throw error;
		}
	}

	async _duplicateResult(existing, { userId, type, amountKobo, source, reference }) {
		const mismatched = [];
		if (existing.userId !== String(userId)) mismatched.push("userId");
		if (existing.type !== type) mismatched.push("type");
		if (existing.amountKobo !== amountKobo) mismatched.push("amountKobo");
		if (existing.source !== source) mismatched.push("source");

		if (mismatched.length) {
			console.error(`[wallet] Reference ${reference} reused with different details: ${mismatched.join(", ")}`);
			throw new ConflictError("This reference was already used for a different wallet transaction", "WALLET_REFERENCE_CONFLICT", { reference, mismatched });
		}

		if (existing.balanceAfterKobo === null || existing.balanceAfterKobo === undefined) {
			console.error(`[wallet] Reference ${reference} exists with an incomplete ledger row (balanceAfterKobo is null). Needs manual review.`);
		}

		return { duplicate: true, transaction: existing, wallet: await this.findByUserId(userId) };
	}

	async _applyInTransaction(entry) {
		const session = await mongoose.startSession();

		try {
			let result;

			await session.withTransaction(async () => {
				const walletDoc = await this._moveBalance(entry, session);
				const [transaction] = await WalletTransactionModel.create(
					[{ ...entry, walletId: walletDoc._id, balanceAfterKobo: walletDoc.balanceKobo }],
					{ session }
				);

				result = { duplicate: false, transaction: toTransaction(transaction.toObject()), wallet: toWallet(walletDoc) };
			});

			return result;
		} finally {
			await session.endSession();
		}
	}

	async _applyWithoutTransaction(entry) {
		const wallet = await WalletModel.findOne({ userId: entry.userId }).select("_id").lean();
		const claimed = await WalletTransactionModel.create({ ...entry, walletId: wallet._id, balanceAfterKobo: null });

		try {
			const walletDoc = await this._moveBalance(entry, null);
			await WalletTransactionModel.updateOne({ _id: claimed._id }, { $set: { balanceAfterKobo: walletDoc.balanceKobo } });

			return {
				duplicate: false,
				transaction: toTransaction({ ...claimed.toObject(), balanceAfterKobo: walletDoc.balanceKobo }),
				wallet: toWallet(walletDoc)
			};
		} catch (error) {
			await WalletTransactionModel.deleteOne({ _id: claimed._id });
			throw error;
		}
	}

	async _moveBalance({ userId, type, amountKobo }, session) {
		const options = { returnDocument: "after", ...(session ? { session } : {}) };

		if (type === WALLET_TX_TYPES.CREDIT) {
			return WalletModel.findOneAndUpdate({ userId }, { $inc: { balanceKobo: amountKobo } }, options).lean();
		}

		const doc = await WalletModel.findOneAndUpdate(
			{ userId, balanceKobo: { $gte: amountKobo } },
			{ $inc: { balanceKobo: -amountKobo } },
			options
		).lean();

		if (!doc) throw new ValidationError("Insufficient wallet balance", WALLET_ERROR_CODES.INSUFFICIENT_BALANCE);
		return doc;
	}
}
