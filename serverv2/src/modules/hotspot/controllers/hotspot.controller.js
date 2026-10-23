// controllers/hotspot.controller.js
import { successResponse } from "../../../shared/utils/api-response.js";

export class HotspotController {
	constructor({
		resolveHotspotSession, authenticateHotspotSession, startHotspot,
		getHotspotPlans, refreshHotspotSession, revokeHotspotSession, getHotspotConnectionStatus, getHotspotWallet
	}) {
		this.getHotspotWalletUseCase = getHotspotWallet;
		this.resolveHotspotSessionUseCase = resolveHotspotSession;
		this.authenticateHotspotSessionUseCase = authenticateHotspotSession;
		this.startHotspotUseCase = startHotspot;
		this.getHotspotPlansUseCase = getHotspotPlans;
		this.refreshHotspotSessionUseCase = refreshHotspotSession;
		this.revokeHotspotSessionUseCase = revokeHotspotSession;
		this.getHotspotConnectionStatusUseCase = getHotspotConnectionStatus;
	}

	resolveSession = async (req, res) => {
		const result = await this.resolveHotspotSessionUseCase.execute({ ...req.query });
		return successResponse({ res, data: result, message: "Session resolved" });
	};

	authenticate = async (req, res) => {
		const result = await this.authenticateHotspotSessionUseCase.execute({ ...req.body, ip: req.ip });
		return successResponse({ res, data: { session: result.session.toJSON(), account: result.account.toJSON() }, message: "Authenticated successfully" });
	};

	startHotspot = async (req, res) => {
		const result = await this.startHotspotUseCase.execute({ ...req.body, ip: req.ip });
		return successResponse({ res, data: { ...result, payment: result.payment?.toJSON?.() ?? result.payment }, message: result.status === "PAID" ? "Paid from wallet" : "Checkout started", statusCode: 201 });
	};

	getWallet = async (req, res) => {
		const wallet = await this.getHotspotWalletUseCase.execute({ ...req.body });
		return successResponse({ res, data: wallet, message: "Wallet fetched successfully" });
	};

	getPlans = async (req, res) => {
		const plans = await this.getHotspotPlansUseCase.execute();
		return successResponse({ res, data: plans.map((p) => p.toJSON()), message: "Plans fetched successfully" });
	};

	getConnectionStatus = async (req, res) => {
		const result = await this.getHotspotConnectionStatusUseCase.execute({ ...req.query });
		return successResponse({ res, data: result, message: "Status fetched" });
	};

	refreshSession = async (req, res) => {
		const session = await this.refreshHotspotSessionUseCase.execute({ macAddress: req.body.macAddress });
		return successResponse({ res, data: session.toJSON(), message: "Session refreshed" });
	};

	revokeSession = async (req, res) => {
		const session = await this.revokeHotspotSessionUseCase.execute({ actorId: req.user?.id ?? null, macAddress: req.body.macAddress, ip: req.ip });
		return successResponse({ res, data: session.toJSON(), message: "Session revoked" });
	};
}