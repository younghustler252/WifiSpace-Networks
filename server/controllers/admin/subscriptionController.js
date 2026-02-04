const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const Subscription = require("../../models/Subscription");
const { getRouterProfiles } = require("../../utils/routerosHelpers")

let cachedProfiles = null;
let cacheTimestamp = 0;

// ------------------------------------------------------------
// ADMIN: CREATE SUBSCRIPTION PLAN
// ------------------------------------------------------------
const createSubscription = asyncHandler(async (req, res) => {
	const {
		planName,
		price,
		speedRate,
		devicesAllowed,
		features,
		mikrotikProfile,
		durationDays,
		description,
	} = req.body;

	// 1️⃣ Basic validation
	if (!planName || price == null || !speedRate) {
		return res
			.status(400)
			.json({ message: "Missing required fields: planName, price, or speedRate." });
	}

	const existing = await Subscription.findOne({ planName });
	if (existing)
		return res.status(400).json({ message: "Plan name already exists." });

	let profileToUse = mikrotikProfile || "default";

	let mikrotikWarning = null;
	// try {
	// 	const routerProfiles = await getRouterProfiles();
	// 	if (!routerProfiles.includes(profileToUse)) {
	// 		mikrotikWarning = `Mikrotik profile "${profileToUse}" does not exist on the router. Available profiles: ${routerProfiles.join(
	// 			", "
	// 		)}.`;
	// 	}
	// } catch (err) {
	// 	console.warn("⚠️ Failed to fetch Mikrotik profiles:", err.message);
	// 	mikrotikWarning = "Could not validate Mikrotik profile (router offline).";
	// }

	// 5️⃣ Create the plan
	const plan = await Subscription.create({
		planName,
		price,
		speedRate,
		devicesAllowed: devicesAllowed || 1,
		features: Array.isArray(features) ? features : [],
		mikrotikProfile: profileToUse,
		durationDays: durationDays || 30,
		description,
	});

	const response = { message: "Plan created successfully", plan };

	res.status(201).json(response);
});



const getMikrotikProfiles = asyncHandler(async (req, res) => {
    console.log("mikrotik Route hit"); // ✅ should print every request

    const now = Date.now();
    if (cachedProfiles && now - cacheTimestamp < 30000) {
        console.log("Returning cached profiles");
        return res.json({ profiles: cachedProfiles });
    }

    try {
        console.log("Calling getRouterProfiles...");
        const profiles = await getRouterProfiles();
        console.log("Profiles fetched:", profiles);
        cachedProfiles = profiles;
        cacheTimestamp = now;
        res.json({ profiles });
    } catch (err) {
        console.error("Failed to fetch Mikrotik profiles:", err);
        res.status(500).json({ message: "Unable to fetch Mikrotik profiles" });
    }
});


// ------------------------------------------------------------
// ADMIN: UPDATE SUBSCRIPTION PLAN
// ------------------------------------------------------------
const updateSubscription = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
    }

    const plan = await Subscription.findById(id);
    if (!plan) return res.status(404).json({ message: "Subscription plan not found" });

    // Whitelist updates to prevent accidental overwrites
    const allowedUpdates = ['planName', 'price', 'speedRate', 'devicesAllowed', 'features', 'mikrotikProfile', 'durationDays', 'description'];
    Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
            if (key === 'features') {
                plan[key] = Array.isArray(updates[key]) ? updates[key] : [];
            } else {
                plan[key] = updates[key];
            }
        }
    });

    await plan.save();

    res.status(200).json({ message: "Subscription updated successfully", plan });
});

// ------------------------------------------------------------
// ADMIN: DELETE SUBSCRIPTION PLAN
// ------------------------------------------------------------
const deleteSubscription = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
    }

    const plan = await Subscription.findById(id);
    if (!plan) return res.status(404).json({ message: "Subscription plan not found" });

    await plan.deleteOne();

    res.status(200).json({ message: "Subscription deleted successfully" });
});

const extendUserSubscription = asyncHandler(async (req, res) => {
    const { userId, extraDays } = req.body;

    if (!userId || !extraDays || extraDays <= 0) {
        return res.status(400).json({ message: "Invalid input" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Extend subscription end date
    const currentEnd = user.subscriptionEnd || new Date();
    user.subscriptionEnd = new Date(currentEnd.getTime() + extraDays * 24 * 60 * 60 * 1000);

    await user.save();

    res.status(200).json({ message: `Subscription extended by ${extraDays} days`, subscriptionEnd: user.subscriptionEnd });
});


module.exports = {
    createSubscription,
    getMikrotikProfiles,
    updateSubscription,
    deleteSubscription,
    extendUserSubscription
};
