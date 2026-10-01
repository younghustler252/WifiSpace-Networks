import { USAGE_SOURCE_LIST } from "./usage.enum.js";
import { ValidationError } from "../../../shared/errors/domain.errors.js";

export class Usage {
	constructor({
		id, subscriptionId, accountId, routerId = null, macAddress = null,
		bytesUsed = 0, secondsUsed = 0, source = "mikrotik_sync",
		recordedAt = new Date(), metadata = {}, createdAt = null
	}) {
		if (!subscriptionId) throw new ValidationError("Subscription ID is required");
		if (!accountId) throw new ValidationError("Account ID is required");
		if (bytesUsed < 0) throw new ValidationError("bytesUsed cannot be negative");
		if (secondsUsed < 0) throw new ValidationError("secondsUsed cannot be negative");
		if (!USAGE_SOURCE_LIST.includes(source)) throw new ValidationError("Invalid usage source");

		Object.assign(this, { id, subscriptionId, accountId, routerId, macAddress, bytesUsed, secondsUsed, source, recordedAt, metadata, createdAt });
	}

	toJSON() { return { ...this }; }
}