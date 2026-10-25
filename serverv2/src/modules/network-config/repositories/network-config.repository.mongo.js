import HotspotProfileModel from "../database/hotspot-profile.model.js";
import WalledGardenEntryModel from "../database/walled-garden-entry.model.js";
import ConfigSyncStateModel from "../database/config-sync-state.model.js";
import { toRateLimit } from "../domain/hotspot-profile.js";

const toProfile = (doc) => doc && {
	id: doc._id.toString(),
	name: doc.name,
	uploadMbps: doc.uploadMbps,
	downloadMbps: doc.downloadMbps,
	rateLimit: toRateLimit(doc.uploadMbps, doc.downloadMbps),
	sharedUsers: doc.sharedUsers,
	macCookieTimeout: doc.macCookieTimeout,
	idleTimeout: doc.idleTimeout,
	statusAutorefresh: doc.statusAutorefresh,
	addMacCookie: doc.addMacCookie,
	transparentProxy: doc.transparentProxy,
	openStatusPage: doc.openStatusPage,
	advertise: doc.advertise,
	description: doc.description,
	deletedAt: doc.deletedAt,
	createdAt: doc.createdAt,
	updatedAt: doc.updatedAt
};

const toEntry = (doc) => doc && {
	id: doc._id.toString(),
	kind: doc.kind,
	dstHost: doc.dstHost,
	dstAddress: doc.dstAddress,
	protocol: doc.protocol,
	dstPort: doc.dstPort,
	path: doc.path,
	action: doc.action,
	description: doc.description,
	enabled: doc.enabled,
	deletedAt: doc.deletedAt,
	createdAt: doc.createdAt,
	updatedAt: doc.updatedAt
};

const ACTIVE = { deletedAt: null };

export class NetworkConfigRepositoryMongo {
	async listProfiles({ includeDeleted = false } = {}) {
		const docs = await HotspotProfileModel.find(includeDeleted ? {} : ACTIVE).sort({ name: 1 }).lean();
		return docs.map(toProfile);
	}

	async findProfileById(id) {
		return toProfile(await HotspotProfileModel.findOne({ _id: id, ...ACTIVE }).lean());
	}

	async findProfileByName(name) {
		return toProfile(await HotspotProfileModel.findOne({ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"), ...ACTIVE }).lean());
	}

	async createProfile(data) {
		const doc = await HotspotProfileModel.create(data);
		return toProfile(doc.toObject());
	}

	async updateProfile(id, data) {
		return toProfile(await HotspotProfileModel.findOneAndUpdate({ _id: id, ...ACTIVE }, { $set: data }, { returnDocument: "after" }).lean());
	}

	async softDeleteProfile(id) {
		await HotspotProfileModel.updateOne({ _id: id }, { $set: { deletedAt: new Date() } });
	}

	async activeProfileNames() {
		const docs = await HotspotProfileModel.find(ACTIVE).select("name").lean();
		return docs.map((doc) => doc.name);
	}

	async deletedProfileNames() {
		const docs = await HotspotProfileModel.find({ deletedAt: { $ne: null } }).select("name").lean();
		return [...new Set(docs.map((doc) => doc.name))];
	}

	async listEntries({ includeDeleted = false } = {}) {
		const docs = await WalledGardenEntryModel.find(includeDeleted ? {} : ACTIVE).sort({ kind: 1, dstHost: 1, dstAddress: 1 }).lean();
		return docs.map(toEntry);
	}

	async findEntryById(id) {
		return toEntry(await WalledGardenEntryModel.findOne({ _id: id, ...ACTIVE }).lean());
	}

	async findEntryByContent({ kind, dstHost = null, dstAddress = null, protocol = null, dstPort = null, path = null }, { excludeId = null } = {}) {
		const filter = { kind, dstHost: dstHost || null, dstAddress: dstAddress || null, protocol: protocol || null, dstPort: dstPort || null, path: path || null, ...ACTIVE };
		if (excludeId) filter._id = { $ne: excludeId };
		return toEntry(await WalledGardenEntryModel.findOne(filter).lean());
	}

	async createEntry(data) {
		const doc = await WalledGardenEntryModel.create(data);
		return toEntry(doc.toObject());
	}

	async updateEntry(id, data) {
		return toEntry(await WalledGardenEntryModel.findOneAndUpdate({ _id: id, ...ACTIVE }, { $set: data }, { returnDocument: "after" }).lean());
	}

	async softDeleteEntry(id) {
		await WalledGardenEntryModel.updateOne({ _id: id }, { $set: { deletedAt: new Date() } });
	}

	async latestChangeAt(resourceType) {
		const model = resourceType === "hotspot_profile" ? HotspotProfileModel : WalledGardenEntryModel;
		const doc = await model.findOne({}).sort({ updatedAt: -1 }).select("updatedAt").lean();
		return doc?.updatedAt ?? null;
	}

	async saveSyncState(routerId, resourceType, state) {
		await ConfigSyncStateModel.updateOne({ routerId, resourceType }, { $set: state }, { upsert: true });
	}

	async listSyncStates() {
		return ConfigSyncStateModel.find({}).lean();
	}
}
