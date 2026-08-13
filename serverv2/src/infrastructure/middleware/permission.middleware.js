// shared/middleware/permission.middleware.js
import asyncHandler from "express-async-handler";

export const requirePermission = (permission, permissionService) =>
	asyncHandler(async (req, res, next) => {
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: "Unauthorized" });

		const hasPerm = await permissionService.hasPermission(userId, permission);

		if (!hasPerm) return res.status(403).json({ message: "Forbidden" });

		next();
	});