// src/modules/hotspot/presentation/routes/hotspot.routes.js

import { Router } from "express";
import expressAsyncHandler from "express-async-handler";


export function hotspotRoutes({hotspotController}) {

	const router = Router();

	// -----------------------------
	// START PURCHASE
	// -----------------------------
	router.post(
		"/purchase",
		expressAsyncHandler(hotspotController.startPurchase)
		
	);

	// -----------------------------
	// CONFIRM PAYMENT
	// -----------------------------
	router.post(
		"/confirm",
		expressAsyncHandler(hotspotController.confirmPurchase)
		
	);

	router.get(
		"/plans",
		expressAsyncHandler(hotspotController.getPlans)
	)


	router.get(
		"/session",
		expressAsyncHandler(hotspotController.getHotspotSessions)
	)

	return router;
}