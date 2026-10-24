import mongoose from "mongoose";

// Temporary maintenance utility. Physical deletion requires MongoDB transaction support.
const oid = (id) => new mongoose.Types.ObjectId(String(id));
const unique = (ids) => [...new Map(ids.filter(Boolean).map((id) => [String(id), oid(id)])).values()];

export class HardDeleteCleanupService {
	constructor({ db = mongoose.connection.db } = {}) {
		this.db = db;
	}

	async cleanup({ userIds = [], accountIds = [], deleteUsers = false, session, dryRun = true }) {
		if (!dryRun && !session) throw new Error("Destructive cleanup requires a MongoDB transaction session");
		const options = session ? { session } : {};
		const users = unique(userIds);
		const explicitAccounts = unique(accountIds);
		const ownedAccounts = users.length ? await this.db.collection("accounts").find({ userId: { $in: users } }, options).project({ _id: 1 }).toArray() : [];
		const accounts = unique([...explicitAccounts, ...ownedAccounts.map((a) => a._id)]);
		const subscriptions = await this.db.collection("subscriptions").find({ $or: [
			{ accountId: { $in: accounts } }, { userId: { $in: users } }
		] }, options).project({ _id: 1 }).toArray();
		const subscriptionIds = subscriptions.map((s) => s._id);
		const payments = await this.db.collection("payments").find({ $or: [
			{ accountId: { $in: accounts } }, { userId: { $in: users } }, { subscriptionId: { $in: subscriptionIds } }
		] }, options).project({ _id: 1 }).toArray();
		const paymentIds = payments.map((p) => p._id);
		const tickets = await this.db.collection("tickets").find({ $or: [
			{ accountId: { $in: accounts } }, { userId: { $in: users } }
		] }, options).project({ _id: 1 }).toArray();
		const ticketIds = tickets.map((t) => t._id);
		const notifications = await this.db.collection("notifications").find({ $or: [
			{ accountId: { $in: accounts } }, { subscriptionId: { $in: subscriptionIds } }
		] }, options).project({ _id: 1 }).toArray();
		const notificationIds = notifications.map((n) => n._id);
		const specs = [
			["usages", { $or: [{ accountId: { $in: accounts } }, { subscriptionId: { $in: subscriptionIds } }] }],
			["usagesummaries", { $or: [{ accountId: { $in: accounts } }, { subscriptionId: { $in: subscriptionIds } }] }],
			["usagesynccursors", { $or: [{ accountId: { $in: accounts } }, { subscriptionId: { $in: subscriptionIds } }] }],
			["hotspotsessions", { $or: [{ accountId: { $in: accounts } }, { userId: { $in: users } }] }],
			["ticketmessages", { ticketId: { $in: ticketIds } }],
			["tickets", { _id: { $in: ticketIds } }],
			["notificationrecipients", { $or: [{ notificationId: { $in: notificationIds } }, { userId: { $in: users } }] }],
			["notifications", { _id: { $in: notificationIds } }],
			["wallettransactions", { userId: { $in: users } }],
			["wallets", { userId: { $in: users } }],
			["payments", { _id: { $in: paymentIds } }],
			["subscriptions", { _id: { $in: subscriptionIds } }],
			["accounts", { _id: { $in: accounts } }]
		];
		if (deleteUsers) specs.push(["users", { _id: { $in: users } }]);
		const counts = {};
		for (const [name, filter] of specs) {
			counts[name] = dryRun
				? await this.db.collection(name).countDocuments(filter, options)
				: (await this.db.collection(name).deleteMany(filter, options)).deletedCount;
		}
		return { dryRun, accountIds: accounts.map(String), userIds: users.map(String), counts };
	}
}
