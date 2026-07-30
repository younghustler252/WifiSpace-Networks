// src/modules/hotspot/presentation/routes/hotspot.routes.js

import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

export function hotspotRoutes({ hotspotController }) {

	const router = Router();

	// -----------------------------
	// GET HOTSPOT SESSION
	// Detect:
	// - remembered device
	// - existing user
	// - new visitor
	// -----------------------------
	router.get(
		"/session",
		expressAsyncHandler(
			hotspotController.getHotspotSession
		)
	);


	// -----------------------------
	// AUTHENTICATE EXISTING USER
	// Password / device verification
	// -----------------------------
	router.post(
		"/authenticate",
		expressAsyncHandler(
			hotspotController.authenticateSession
		)
	);


	// -----------------------------
	// START PURCHASE
	// New hotspot user
	// -----------------------------
	router.post(
		"/purchase",
		expressAsyncHandler(
			hotspotController.startPurchase
		)
	);


	// -----------------------------
	// CONFIRM PAYMENT
	// -----------------------------
	router.post(
		"/confirm",
		expressAsyncHandler(
			hotspotController.confirmPurchase
		)
	);


	// -----------------------------
	// AVAILABLE PLANS
	// -----------------------------
	router.get(
		"/plans",
		expressAsyncHandler(
			hotspotController.getPlans
		)
	);


	// -----------------------------
	// LOGOUT / FORGET DEVICE
	// -----------------------------
	router.post(
		"/logout",
		expressAsyncHandler(
			hotspotController.revokeSession
		)
	);


	return router;
}