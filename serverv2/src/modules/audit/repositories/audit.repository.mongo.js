import { BaseRepository } from "../../../infrastructure/repositories/base.repository.js";
import AuditModel from "../database/audit.model.js";
import { AuditMapper } from "../mappers/audit.mapper.js";

export class AuditRepositoryMongo extends BaseRepository {
	constructor() {
		super(AuditModel, AuditMapper);
	}
}