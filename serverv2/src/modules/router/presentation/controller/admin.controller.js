// src/interfaces/http/controllers/admin-router.controller.js
import { successResponse } from "../../../../shared/utils/api-response.js";

export class AdminRouterController {
	constructor({ createRouter, updateRouter, deleteRouter, listRouters }) {
		this.createRouter = createRouter;
		this.updateRouter = updateRouter;
		this.deleteRouter = deleteRouter;
		this.listRouters = listRouters;
	}

	// ==================================================
	// Create a new Router
	// ==================================================
	async create(req, res, next) {
		try {
			const { name, host, username, password, port, routerType } = req.body;
			const currentUser = { id: req.user?.id || "SYSTEM_ADMIN" };

			console.log("=== CREATE ROUTER REQUEST ===");
			console.log("Request body:", req.body);
			console.log("Current user:", currentUser);

			const router = await this.createRouter.execute({
				name,
				host,
				username,
			password,
				port,
				routerType,
				context: {
					actorId: currentUser.id,
					ip: req.ip,
					userAgent: req.get("User-Agent")
				}
			});

			console.log("Router created:", router);

			return successResponse({
				res,
				data: router,
				message: "Router created successfully",
				code: "ROUTER_CREATED",
				statusCode: 201
			});
		} catch (error) {
			console.error("Error in create router:", error);
			next(error);
		}
	}
	// ==================================================
	// Update Router Info
	// ==================================================
	async update(req, res, next) {
		try {
			const { id } = req.params;
			const updateData = req.body;
			const currentUser = { id: req.user?.id || "SYSTEM_ADMIN" };

			const updatedRouter = await this.updateRouter.execute(id, {
				...updateData,
				actorId: currentUser.id
			});

			return successResponse({
				res,
				data: updatedRouter,
				message: "Router updated successfully",
				code: "ROUTER_UPDATED"
			});
		} catch (error) {
			next(error);
		}
	}

	// ==================================================
	// Delete Router
	// ==================================================
	async delete(req, res, next) {
		try {
			const { id } = req.params;
			const currentUser = { id: req.user?.id || "SYSTEM_ADMIN" };

			const result = await this.deleteRouter.execute(id, {
				actorId: currentUser.id
			});

			return successResponse({
				res,
				data: result,
				message: "Router deleted successfully",
				code: "ROUTER_DELETED"
			});
		} catch (error) {
			next(error);
		}
	}

	// ==================================================
	// List All Routers
	// ==================================================
	async list(req, res, next) {
		try {
			const routers = await this.listRouters.execute();

			return successResponse({
				res,
				data: routers,
				message: "Routers fetched successfully",
				code: "ROUTERS_FETCHED"
			});
		} catch (error) {
			next(error);
		}
	}
}