import mongoose from "mongoose";
import WalletModel from "../database/wallet.model.js";
import WalletTransactionModel from "../database/wallet-transaction.model.js";
import { ValidationError } from "../../../shared/errors/domain.errors.js";
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

	async saveVirtualAccount(userId, virtualAccount) {
		const doc = await WalletModel.findOneAndUpdate(
			{ userId },
			{ $set: { virtualAccount: { ...virtualAccount, assignedAt: new Date() } } },
			{ upsert: true, returnDocument: "after" }
		).lean();

		return toWallet(doc);
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
		if (existing) return { duplicate: true, transaction: existing, wallet: await this.findByUserId(userId) };

		await this.ensureWallet(userId);
		const entry = { userId, type, amountKobo, source, reference, description, metadata };

		try {
			if (this.transactionsSupported) return await this._applyInTransaction(entry);
			return await this._applyWithoutTransaction(entry);
		} catch (error) {
			if (isDuplicateKey(error)) {
				const transaction = await this.findTransactionByReference(reference);
				if (transaction) return { duplicate: true, transaction, wallet: await this.findByUserId(userId) };
			}

			if (this.transactionsSupported && lacksTransactions(error)) {
				this.transactionsSupported = false;
				console.warn("[wallet] MongoDB has no replica set, falling back to non-transactional wallet writes");
				return this._applyWithoutTransaction(entry);
			}

			throw error;
		}
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
