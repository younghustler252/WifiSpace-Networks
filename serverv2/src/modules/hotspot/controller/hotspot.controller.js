import { successResponse } from "../../../shared/utils/api-response.js";

export class HotspotController {
	constructor({
		startHotspotPurchase,
		confirmHotspotPurchase,
		getHotspotPlans,
		getHotspotSession,
		// createHotspotSession,
		authenticateHotspotSession,
		revokeHotspotSession,
	}) {
		this.startHotspotPurchaseUseCase = startHotspotPurchase;
		this.confirmHotspotPurchaseUseCase = confirmHotspotPurchase;
		this.getHotspotPlansUseCase = getHotspotPlans;
		this.getHotspotSessionUseCase = getHotspotSession;
		// this.createHotspotSessionUseCase = createHotspotSession;
		this.authenticateHotspotSessionUseCase =
			authenticateHotspotSession;
		this.revokeHotspotSessionUseCase =
			revokeHotspotSession;
	
	}

	// --------------------------------
	// START PURCHASE
	// --------------------------------

	startPurchase = async (req, res) => {
		const result =
			await this.startHotspotPurchaseUseCase.execute({
				...req.body,
				ipAddress: req.body.ipAddress || req.ip,
				userAgent: req.headers["user-agent"]
			});

		return successResponse({
			res,
			data: result,
			message: "Hotspot purchase initiated successfully"
		});
	};

	// --------------------------------
	// CONFIRM PAYMENT
	// --------------------------------

	confirmPurchase = async (req, res, next) => {
		try {
			const result = await this.confirmHotspotPurchaseUseCase.execute({
				reference: req.body.reference
			});

			return successResponse({
				res,
				data: result,
				message: "Payment confirmed successfully"
			});
		} catch (err) {
			next(err);
		}
	};

	// --------------------------------
	// HOTSPOT SESSION
	// --------------------------------

	getHotspotSession = async (req, res) => {
		const result =
			await this.getHotspotSessionUseCase.execute({
				email: req.query.email,
				macAddress: req.query.macAddress
			});

		return successResponse({
			res,
			data: result,
			message: "Hotspot session resolved successfully"
		});
	};

	// --------------------------------
	// LOGIN / REMEMBER DEVICE
	// --------------------------------

	authenticateSession = async (req, res) => {
		const result =
			await this.authenticateHotspotSessionUseCase.execute({
				...req.body,
				ipAddress: req.body.ipAddress || req.ip,
				userAgent: req.headers["user-agent"]
			});

		return successResponse({
			res,
			data: result,
			message: "Device authenticated successfully"
		});
	};

	// --------------------------------
	// LOGOUT DEVICE
	// --------------------------------

	revokeSession = async (req, res) => {
		const result =
			await this.revokeHotspotSessionUseCase.execute({
				token: req.body.token
			});

		return successResponse({
			res,
			data: result,
			message: "Session revoked successfully"
		});
	};

	// --------------------------------
	// HOTSPOT PLANS
	// --------------------------------

	getPlans = async (req, res) => {
		const result =
			await this.getHotspotPlansUseCase.execute({
				page: req.query.page,
				limit: req.query.limit
			});

		return successResponse({
			res,
			data: result,
			message: "Hotspot plans fetched successfully"
		});
	};

	// --------------------------------
	// ROUTER ACTIVATION
	// --------------------------------

	// activateHotspot = async (req, res) => {
	// 	const result =
	// 		await this.activateHotspotAccessUseCase.execute({
	// 			accountId: req.body.accountId,
	// 			routerId: req.body.routerId,
	// 			macAddress: req.body.macAddress,
	// 			hostname: req.body.hostname,
	// 			ipAddress: req.body.ipAddress || req.ip
	// 		});

	// 	return successResponse({
	// 		res,
	// 		data: result,
	// 		message: "Hotspot access activated successfully"
	// 	});
	// };
}