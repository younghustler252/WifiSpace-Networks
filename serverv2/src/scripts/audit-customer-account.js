// Read-only customer account audit.
// This script never creates, updates, deletes, or repairs database records.
import "../config/env.js";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { databaseConfig } from "../config/database.js";
import UserModel from "../modules/user/database/user.model.js";
import AccountModel from "../modules/account/database/account.model.js";
import WalletModel from "../modules/wallet/database/wallet.model.js";
import WalletTransactionModel from "../modules/wallet/database/wallet-transaction.model.js";
import PaymentModel from "../modules/payment/database/payment.model.js";
import SubscriptionModel from "../modules/subscription/database/subscription.model.js";
import AuditLogModel from "../modules/audit/database/audit.model.js";

const args = new Map(
	process.argv.slice(2).map((arg) => {
		const [key, ...value] = arg.replace(/^--/, "").split("=");
		return [key, value.join("=") || "true"];
	})
);

const requestedName = args.get("name");
const requestedUserId = args.get("user-id");
const outputDirectory = path.resolve("reports");

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toId(value) {
	return value ? String(value) : null;
}

function safeMetadata(metadata = {}) {\n\tmetadata = metadata ?? {};
	return {
		gatewayReference: metadata.gatewayReference ?? null,
		accountNumber: metadata.accountNumber ?? null,
		gateway: metadata.gateway ?? null,
		channel: metadata.channel ?? null
	};
}

function summarizePayment(payment) {
	return {
		id: toId(payment._id),
		userId: toId(payment.userId),
		accountId: toId(payment.accountId),
		subscriptionId: toId(payment.subscriptionId),
		planId: toId(payment.planId),
		actionType: payment.actionType,
		amount: payment.amount,
		currency: payment.currency,
		status: payment.status,
		gateway: payment.gateway,
		gatewayReference: payment.gatewayReference ?? null,
		paymentChannel: payment.paymentChannel ?? null,
		businessProcessed: payment.businessProcessed,
		paymentDate: payment.paymentDate,
		processedAt: payment.processedAt ?? null,
		failedAt: payment.failedAt ?? null,
		failureReason: payment.failureReason ?? null,
		metadata: safeMetadata(payment.metadata),
		createdAt: payment.createdAt,
		updatedAt: payment.updatedAt
	};
}

function summarizeSubscription(subscription) {
	return {
		id: toId(subscription._id),
		userId: toId(subscription.userId),
		accountId: toId(subscription.accountId),
		planId: toId(subscription.planId),
		status: subscription.status,
		planSnapshot: subscription.planSnapshot,
		cycles: subscription.cycles,
		totalAmount: subscription.totalAmount,
		startsAt: subscription.startsAt ?? null,
		expiresAt: subscription.expiresAt ?? null,
		activatedAt: subscription.activatedAt ?? null,
		lastPaymentId: toId(subscription.lastPaymentId),
		lastPaymentDate: subscription.lastPaymentDate ?? null,
		lastPaymentAmount: subscription.lastPaymentAmount ?? null,
		mikrotikStatus: subscription.mikrotikStatus,
		mikrotikLastSyncAt: subscription.mikrotikLastSyncAt ?? null,
		mikrotikError: subscription.mikrotikError ?? null,
		autoRenewEnabled: subscription.autoRenewEnabled,
		autoRenewMethod: subscription.autoRenewMethod,
		autoRenewAttempts: subscription.autoRenewAttempts,
		lastAutoRenewAttemptAt: subscription.lastAutoRenewAttemptAt ?? null,
		lastAutoRenewError: subscription.lastAutoRenewError ?? null,
		events: (subscription.events ?? []).map((event) => ({
			type: event.type,
			date: event.date,
			metadata: event.metadata ?? null
		})),
		createdAt: subscription.createdAt,
		updatedAt: subscription.updatedAt
	};
}

async function findUser() {
	if (requestedUserId) {
		if (!mongoose.isValidObjectId(requestedUserId)) {
			throw new Error("--user-id must be a valid MongoDB ObjectId.");
		}
		return UserModel.findById(requestedUserId)
			.select("_id firstName lastName email phone role status isVerified createdAt updatedAt lastLoginAt")
			.lean();
	}

	if (!requestedName) {
		throw new Error('Provide --name="First Last" or --user-id=<MongoDB ObjectId>.');
	}

	const parts = requestedName.trim().split(/\s+/);
	if (parts.length < 2) {
		throw new Error('Provide both first and last name, e.g. --name="Abdullahi Garba".');
	}

	const [firstName, ...lastNameParts] = parts;
	const lastName = lastNameParts.join(" ");
	const matches = await UserModel.find({
		firstName: new RegExp(`^${escapeRegex(firstName)}$`, "i"),
		lastName: new RegExp(`^${escapeRegex(lastName)}$`, "i")
	})
		.select("_id firstName lastName email phone role status isVerified createdAt updatedAt lastLoginAt")
		.limit(10)
		.lean();

	if (matches.length > 1) {
		console.log(JSON.stringify({
			status: "ambiguous_user",
			message: "More than one user matched. Re-run with --user-id using the correct ID.",
			matches: matches.map(({ _id, firstName, lastName, email }) => ({
				id: toId(_id), firstName, lastName, email
			}))
		}, null, 2));
		return null;
	}

	return matches[0] ?? null;
}

async function main() {
	if (!process.env.MONGO_URI) {
		throw new Error("MONGO_URI is missing. Check the selected environment file.");
	}

	// Override the project's autoIndex:true setting so connecting for an audit
	// cannot trigger automatic index creation.
	mongoose.set("autoIndex", false);
	await mongoose.connect(databaseConfig.uri, {
		...databaseConfig.options,
		autoIndex: false
	});

	const user = await findUser();
	if (!user) {
		console.log(JSON.stringify({
			status: "user_not_found",
			requestedName: requestedName ?? null,
			requestedUserId: requestedUserId ?? null
		}, null, 2));
		return;
	}

	const userId = user._id;
	const [accounts, wallets] = await Promise.all([
		AccountModel.find({ userId }).lean(),
		WalletModel.find({ userId }).lean()
	]);

	const accountIds = accounts.map((item) => item._id);
	const walletIds = wallets.map((item) => item._id);
	const [payments, subscriptions, walletTransactions] = await Promise.all([
		PaymentModel.find({
			$or: [
				{ userId },
				...(accountIds.length ? [{ accountId: { $in: accountIds } }] : [])
			]
		}).sort({ createdAt: 1, _id: 1 }).lean(),
		SubscriptionModel.find({
			$or: [
				{ userId },
				...(accountIds.length ? [{ accountId: { $in: accountIds } }] : [])
			]
		}).sort({ createdAt: 1, _id: 1 }).lean(),
		WalletTransactionModel.find({
			$or: [
				{ userId },
				...(walletIds.length ? [{ walletId: { $in: walletIds } }] : [])
			]
		}).sort({ createdAt: 1, _id: 1 }).lean()
	]);

	const relatedEntityIds = [
		userId,
		...accountIds,
		...walletIds,
		...payments.map((item) => item._id),
		...subscriptions.map((item) => item._id),
		...walletTransactions.map((item) => item._id)
	];
	const auditLogs = await AuditLogModel.find({
		$or: [
			{ actorId: userId },
			{ entityId: { $in: relatedEntityIds } }
		]
	}).sort({ createdAt: 1, _id: 1 }).lean();

	const transactionSummaries = walletTransactions.map((transaction) => ({
		id: toId(transaction._id),
		walletId: toId(transaction.walletId),
		userId: toId(transaction.userId),
		type: transaction.type,
		source: transaction.source,
		amountKobo: transaction.amountKobo,
		balanceAfterKobo: transaction.balanceAfterKobo ?? null,
		reference: transaction.reference,
		description: transaction.description ?? null,
		metadata: safeMetadata(transaction.metadata),
		createdAt: transaction.createdAt
	}));

	const walletSummaries = wallets.map((wallet) => {
		const ledger = walletTransactions
			.filter((transaction) => String(transaction.walletId) === String(wallet._id))
			.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt) || String(a._id).localeCompare(String(b._id)));

		const creditsKobo = ledger
			.filter((transaction) => transaction.type === "credit")
			.reduce((sum, transaction) => sum + transaction.amountKobo, 0);
		const debitsKobo = ledger
			.filter((transaction) => transaction.type === "debit")
			.reduce((sum, transaction) => sum + transaction.amountKobo, 0);
		const netLedgerKobo = creditsKobo - debitsKobo;
		const firstTransaction = ledger[0];
		const firstSignedAmount = firstTransaction
			? (firstTransaction.type === "credit" ? firstTransaction.amountKobo : -firstTransaction.amountKobo)
			: 0;
		const impliedOpeningBalanceKobo = firstTransaction?.balanceAfterKobo == null
			? null
			: firstTransaction.balanceAfterKobo - firstSignedAmount;
		const expectedBalanceKobo = impliedOpeningBalanceKobo == null
			? netLedgerKobo
			: impliedOpeningBalanceKobo + netLedgerKobo;

		let runningBalanceKobo = impliedOpeningBalanceKobo ?? 0;
		const snapshotMismatches = [];
		for (const transaction of ledger) {
			runningBalanceKobo += transaction.type === "credit"
				? transaction.amountKobo
				: -transaction.amountKobo;
			if (transaction.balanceAfterKobo != null && transaction.balanceAfterKobo !== runningBalanceKobo) {
				snapshotMismatches.push({
					transactionId: toId(transaction._id),
					reference: transaction.reference,
					expectedBalanceKobo: runningBalanceKobo,
					recordedBalanceAfterKobo: transaction.balanceAfterKobo
				});
			}
		}

		return {
			id: toId(wallet._id),
			userId: toId(wallet.userId),
			balanceKobo: wallet.balanceKobo,
			currency: wallet.currency,
			virtualAccount: {
				accountNumber: wallet.virtualAccount?.accountNumber ?? null,
				bankName: wallet.virtualAccount?.bankName ?? null,
				accountName: wallet.virtualAccount?.accountName ?? null,
				customerCode: wallet.virtualAccount?.customerCode ?? null,
				assignedAt: wallet.virtualAccount?.assignedAt ?? null
			},
			ledger: {
				transactionCount: ledger.length,
				creditsKobo,
				debitsKobo,
				netLedgerKobo,
				impliedOpeningBalanceKobo,
				expectedBalanceKobo,
				walletBalanceMatchesLedger: wallet.balanceKobo === expectedBalanceKobo,
				snapshotMismatches
			},
			createdAt: wallet.createdAt,
			updatedAt: wallet.updatedAt
		};
	});

	const paymentIds = new Set(payments.map((item) => String(item._id)));
	const subscriptionIds = new Set(subscriptions.map((item) => String(item._id)));
	const paymentsWithoutSubscription = payments
		.filter((payment) => payment.subscriptionId && !subscriptionIds.has(String(payment.subscriptionId)))
		.map((payment) => ({ paymentId: toId(payment._id), subscriptionId: toId(payment.subscriptionId) }));
	const subscriptionsWithoutPayment = subscriptions
		.filter((subscription) => subscription.lastPaymentId && !paymentIds.has(String(subscription.lastPaymentId)))
		.map((subscription) => ({ subscriptionId: toId(subscription._id), lastPaymentId: toId(subscription.lastPaymentId) }));

	const report = {
		audit: {
			generatedAt: new Date().toISOString(),
			mode: "read-only",
			environment: process.env.NODE_ENV ?? "development",
			databaseName: mongoose.connection.name,
			userSearch: requestedUserId ? { userId: requestedUserId } : { name: requestedName },
			checks: [
				"User and account records",
				"All linked wallets and wallet transactions",
				"Wallet credit/debit totals and balance snapshots",
				"All linked payments and gateway references",
				"All linked subscriptions and payment relationships",
				"Audit events performed by or against this account"
			]
		},
		user: {
			id: toId(user._id),
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			phone: user.phone ?? null,
			role: user.role,
			status: user.status,
			isVerified: user.isVerified,
			lastLoginAt: user.lastLoginAt ?? null,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		},
		accounts: accounts.map((account) => ({
			id: toId(account._id),
			wsnId: account.wsnId,
			serviceType: account.serviceType ?? null,
			accountType: account.accountType,
			businessName: account.businessName ?? null,
			status: account.status,
			approvalStatus: account.approvalStatus,
			deletedAt: account.deletedAt ?? null,
			devices: (account.devices ?? []).map((device) => ({
				macAddress: device.macAddress,
				hostname: device.hostname,
				lastSeenAt: device.lastSeenAt ?? null
			})),
			createdAt: account.createdAt,
			updatedAt: account.updatedAt
		})),
		wallets: walletSummaries,
		walletTransactions: transactionSummaries,
		payments: payments.map(summarizePayment),
		subscriptions: subscriptions.map(summarizeSubscription),
		auditLogs: auditLogs.map((entry) => ({
			id: toId(entry._id),
			actorId: toId(entry.actorId),
			actorType: entry.actorType,
			action: entry.action,
			entity: entry.entity,
			entityId: toId(entry.entityId),
			createdAt: entry.createdAt
		})),
		relationshipChecks: {
			paymentsPointingToMissingSubscriptions: paymentsWithoutSubscription,
			subscriptionsPointingToMissingPayments: subscriptionsWithoutPayment
		}
	};

	fs.mkdirSync(outputDirectory, { recursive: true });
	const filename = `account-audit-${toId(user._id)}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
	const reportPath = path.join(outputDirectory, filename);
	fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

	console.log(JSON.stringify({
		status: "completed",
		mode: "read-only",
		environment: report.audit.environment,
		databaseName: report.audit.databaseName,
		user: report.user,
		summary: {
			accounts: accounts.length,
			wallets: wallets.length,
			walletTransactions: walletTransactions.length,
			payments: payments.length,
			subscriptions: subscriptions.length,
			auditLogs: auditLogs.length,
			walletBalanceChecks: walletSummaries.map((wallet) => ({
				walletId: wallet.id,
				balanceKobo: wallet.balanceKobo,
				expectedBalanceKobo: wallet.ledger.expectedBalanceKobo,
				walletBalanceMatchesLedger: wallet.ledger.walletBalanceMatchesLedger,
				snapshotMismatchCount: wallet.ledger.snapshotMismatches.length
			})),
			paymentsPointingToMissingSubscriptions: paymentsWithoutSubscription.length,
			subscriptionsPointingToMissingPayments: subscriptionsWithoutPayment.length
		},
		reportPath
	}, null, 2));
}

main()
	.catch((error) => {
		console.error("Account audit failed:", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		if (mongoose.connection.readyState !== 0) {
			await mongoose.disconnect();
		}
	});
