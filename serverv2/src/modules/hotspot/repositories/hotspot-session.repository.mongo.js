import { HotspotSessionRepository } from "./hotspot-session.repository.js";
import { HotspotSessionModel } from "../database/hotspot-session.model.js";
import { HotspotSessionMapper } from "../mappers/hotspot-session.mapper.js";

export class HotspotSessionRepositoryMongo extends HotspotSessionRepository {
	async create(session) {
		const document = await HotspotSessionModel.create(
			HotspotSessionMapper.toPersistence(session)
		);

		return HotspotSessionMapper.toDomain(document);
	}

	async findById(id) {
		const document = await HotspotSessionModel.findById(id);

		return HotspotSessionMapper.toDomain(document);
	}

	async findByMac(macAddress) {
		const document = await HotspotSessionModel.findOne({
			macAddress: macAddress.toUpperCase()
		});

		return HotspotSessionMapper.toDomain(document);
	}

	async findByUser(userId) {
		const documents = await HotspotSessionModel.find({
			userId
		}).sort({ updatedAt: -1 });

		return documents.map(HotspotSessionMapper.toDomain);
	}

	async findByAccount(accountId) {
		const documents = await HotspotSessionModel.find({
			accountId
		}).sort({ updatedAt: -1 });

		return documents.map(HotspotSessionMapper.toDomain);
	}

	async update(id, session) {
		const document = await HotspotSessionModel.findByIdAndUpdate(
			id,
			HotspotSessionMapper.toPersistence(session),
			{
				new: true,
				runValidators: true
			}
		);

		return HotspotSessionMapper.toDomain(document);
	}

	async delete(id) {
		await HotspotSessionModel.findByIdAndDelete(id);
	}

	async findActiveByMac(macAddress) {
		const document = await HotspotSessionModel.findOne({
			macAddress: macAddress.toUpperCase(),
			status: "authenticated"
		}).sort({ updatedAt: -1 });

		return HotspotSessionMapper.toDomain(document);
	}

	async revokeByAccount(accountId) {
		await HotspotSessionModel.updateMany(
			{
				accountId,
				status: "authenticated"
			},
			{
				status: "revoked"
			}
		);
	}
}