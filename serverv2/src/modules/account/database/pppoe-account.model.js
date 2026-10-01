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

	routerPasswordEncrypted: {
		type: String,
		default: null,
		select: false
	},

	limitUptime: {
		type: Number,
		default: 0
	}
});

pppoeAccountSchema.index({ routerId: 1 });
pppoeAccountSchema.index({ routerProfile: 1 });

export const PppoeAccountModel = AccountModel.discriminator(
	SERVICE_TYPES.PPPOE,
	pppoeAccountSchema
);
