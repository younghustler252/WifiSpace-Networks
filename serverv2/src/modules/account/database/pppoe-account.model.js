// models/pppoe-account.model.js
import mongoose from "mongoose";
import AccountModel from "./account.model.js";
import { SERVICE_TYPES } from "../domain/account.enum.js";

const pppoeAccountSchema = new mongoose.Schema({
	routerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Router",
		default: null
	},

	routerProfile: {
		type: String,
		default: "default"
	},

	accessMethod: { type: String, enum: ["ppp", "ipoe"], default: "ipoe" },
	macAddress: { type: String, uppercase: true, trim: true, default: null },
	staticIp: { type: String, trim: true, default: null },

	routerPasswordEncrypted: {
		type: String,
		default: null,
		select: false
	},

	limitUptime: {
		type: Number,
		default: 0
	},

	requestedLocation: {
		address: { type: String, trim: true },
		landmark: { type: String, trim: true },
		city: { type: String, trim: true },
		state: { type: String, trim: true },
		coordinates: { lat: Number, lng: Number }
	}
});

pppoeAccountSchema.index({ routerId: 1 });
pppoeAccountSchema.index({ routerProfile: 1 });

export const PppoeAccountModel = AccountModel.discriminator(
	SERVICE_TYPES.PPPOE,
	pppoeAccountSchema
);
