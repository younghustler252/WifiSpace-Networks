// services/subscriptionsService.js
import API from "../Api/axios"; // your axios instance
import { handleError } from "../utils/handleError";

// ------------------------------------------------------------
// 1️⃣ CREATE SUBSCRIPTIONs PLAN (ADMIN)
// ------------------------------------------------------------
export const createSubscription = async (subscriptionsData) => {
	try {
		const { data } = await API.post("/subscriptions", subscriptionsData);
		return data;
	} catch (error) {
		throw handleError(error);
	}
};

// ------------------------------------------------------------
// 2️⃣ GET ALL PLANS (USER / ADMIN)
// ------------------------------------------------------------
export const getAllPlans = async () => {
	try {
		const { data } = await API.get("/subscriptions");
		return data;
	} catch (error) {
		throw handleError(error);
	}
};

// ------------------------------------------------------------
// 3️⃣ PURCHASE SUBSCRIPTIONs (USER)
// ------------------------------------------------------------
export const purchaseSubscription = async (planId, paymentMethod = "wallet") => {
	try {
		const { data } = await API.post("/subscriptions/purchase", { planId, paymentMethod });
		return data;
	} catch (error) {
		throw handleError(error);
	}
};

// ------------------------------------------------------------
// 3️⃣ GET CURRENT SUBSCRIPTION (USER)
// ------------------------------------------------------------
export const getCurrentSubscription = async () => {
	try {
		const { data } = await API.get("/subscriptions/current");
		return data; // returns current subscription data (null if no active subscription)
	} catch (error) {
		throw handleError(error);
	}
};

// ------------------------------------------------------------
// 4️⃣ CANCEL SUBSCRIPTIONs (USER)
// ------------------------------------------------------------
export const unsubscribeUser = async () => {
	try {
		const { data } = await API.post("/subscriptions/cancel");
		return data;
	} catch (error) {
		throw handleError(error);
	}
};
