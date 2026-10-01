import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import { HotspotSessionModel } from "../database/hotspot-session.model.js";
import { HotspotSessionMapper } from "../mappers/hotspot-session.mapper.js";

export class HotspotSessionRepositoryMongo extends BaseRepository {
	constructor() {
		super(HotspotSessionModel, HotspotSessionMapper);
	}

	async findByMac(macAddress) {
		return this.findOne({ filter: { macAddress: macAddress.toUpperCase().trim() } });
	}

	async update(id, entityOrData) {
		const persistence = HotspotSessionMapper.toPersistence(entityOrData);
		await this.model.findByIdAndUpdate(id, persistence, { new: true });
		return this.findById(id);
	}

	async upsertByMac(macAddress, entity) {
		const persistence = HotspotSessionMapper.toPersistence(entity);
		const doc = await this.model.findOneAndUpdate(
			{ macAddress: macAddress.toUpperCase().trim() },
			{ $set: persistence },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
		return this.mapOne(doc);
	}
}