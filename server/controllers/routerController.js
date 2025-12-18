const asyncHandler = require("express-async-handler");
const routerosQueue = require("../queues/routerosQueue");
const routeros = require("../utils/routerosHelpers");

// --------------------------------------------------
//	Get ALL hotspot users (direct read, safe)
// --------------------------------------------------
exports.getHotspotUsers = asyncHandler(async (req, res) => {
	const users = await routeros.getHotspotUsers();
	return res.status(200).json(users);
});

// --------------------------------------------------
//	Get Active Users (direct read)
// --------------------------------------------------
exports.getActiveUsers = asyncHandler(async (req, res) => {
	const sessions = await routeros.getActiveUsers();
	return res.status(200).json(sessions);
});

// --------------------------------------------------
//	Disable User (queued)
// --------------------------------------------------
exports.disableUser = asyncHandler(async (req, res) => {
	const { username } = req.body;

	await routerosQueue.add("disable_user", {
		type: "disable_user",
		payload: { username }
	});

	return res.status(202).json({ message: "User disable queued." });
});

// --------------------------------------------------
//	Enable User (queued)
// --------------------------------------------------
exports.enableUser = asyncHandler(async (req, res) => {
	const { username } = req.body;

	await routerosQueue.add("enable_user", {
		type: "enable_user",
		payload: { username }
	});

	return res.status(202).json({ message: "User enable queued." });
});

// --------------------------------------------------
//	Update Password (queued)
// --------------------------------------------------
exports.updatePassword = asyncHandler(async (req, res) => {
	const { username, newPassword } = req.body;

	await routerosQueue.add("update_password", {
		type: "update_password",
		payload: { username, newPassword }
	});

	return res.status(202).json({ message: "Password update queued." });
});

// --------------------------------------------------
//	Update Profile (queued)
// --------------------------------------------------
exports.updateProfile = asyncHandler(async (req, res) => {
	const { username, profile } = req.body;

	await routerosQueue.add("update_profile", {
		type: "update_profile",
		payload: { username, profile }
	});

	return res.status(202).json({ message: "Profile update queued." });
});

// --------------------------------------------------
//	Kick User Session (queued)
// --------------------------------------------------
exports.kickSession = asyncHandler(async (req, res) => {
	const { sessionId } = req.body;

	await routerosQueue.add("kick_session", {
		type: "kick_session",
		payload: { sessionId }
	});

	return res.status(202).json({ message: "Session kick queued." });
});
