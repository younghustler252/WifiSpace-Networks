// model/hotspot-account.model.js
import mongoose from "mongoose";
import AccountModel from "./account.model.js";
import { SERVICE_TYPES } from "../domain/account.enum.js";

const hotspotAccountSchema = new mongoose.Schema({
	maxDevices: { type: Number, default: 1 },
	devices: [{
		macAddress: { type: String, uppercase: true, trim: true },
		hostname: String,
		lastSeenAt: Date
	}]
});

hotspotAccountSchema.index({ "devices.macAddress": 1 });

export const HotspotAccountModel = AccountModel.discriminator(SERVICE_TYPES.HOTSPOT, hotspotAccountSchema);