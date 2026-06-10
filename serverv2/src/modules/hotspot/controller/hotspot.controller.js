// src/modules/auth/presentation/controllers/hotspot.controller.js

import { successResponse } from "../../../shared/utils/api-response.js";

export class HotspotController {

	constructor({
		startHotspotPurchase,
		confirmHotspotPurchase,
		getHotspotPlans,
		getHotspotSession
	}) {

		this.startHotspotPurchaseUseCase =
			startHotspotPurchase;

		this.confirmHotspotPurchaseUseCase =
			confirmHotspotPurchase;

		this.getHotspotPlansUseCase = getHotspotPlans;

		this.getHotspotSessionUsecase = getHotspotSession;
	}

	// -----------------------------
	// START PURCHASE
	// -----------------------------
	startPurchase = async (req, res) => {

		console.log("resolved ip", req.body.ipAddress );
		const result = await this.startHotspotPurchaseUseCase.execute({
			...req.body,
			ipAddress:  req.body.ipAddress || req.ip,  // ← use frontend value first
			userAgent:  req.headers["user-agent"]
			
		});
		console.log("Result:", result);

		return successResponse({
			res,
			data: result,
			message: "Hotspot purchase initiated successfully"
		});
	};
	// -----------------------------
	// CONFIRM PAYMENT
	// -----------------------------
	confirmPurchase = async (req, res) => {

		const { reference } = req.body;

		const result =
			await this.confirmHotspotPurchaseUseCase.execute(
				reference
			);

		return successResponse({
			res,
			data: result,
			message: "Payment confirmed and hotspot activated successfully"
		});
	};

		// -----------------------------
	// GET HOTSPOT PLANS
	// -----------------------------
	getPlans = async (req, res) => {
		const { page, limit } = req.query;

		const result =
			await this.getHotspotPlansUseCase.execute({
				page,
				limit
			});

		return successResponse({
			res,
			data: result,
			message: "Hotspot plans fetched successfully"
		});
	};

	getHotspotSessions = async (req, res) => {
		const { macAddress } = req.query;

		const result = await this.getHotspotSessionUsecase.execute({
			macAddress
		})

		return successResponse({
			res,
			data: result,
			message: "session fetched succesfully"
		})


	}
}