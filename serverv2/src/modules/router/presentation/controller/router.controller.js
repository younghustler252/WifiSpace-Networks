import mongoose from "mongoose";
import { successResponse } from "../../../../shared/utils/api-response.js";

export class RouterController {
    constructor({
        checkRouterStatus,
        rebootRouter,
        getRouterProfiles,
        // Admin-level
        createRouter,
        updateRouter,
        deleteRouter,
        listRouters,
    }) {

        this.checkRouterStatus = checkRouterStatus;
        this.rebootRouter = rebootRouter;
        this.getRouterProfiles = getRouterProfiles

        // Admin-level
        this.createRouter = createRouter;
        this.updateRouter = updateRouter;
        this.deleteRouter = deleteRouter;
        this.listRouters = listRouters;
    }

    // ==================================================
    // Admin-level: Create Router
    // ==================================================
    async create(req, res, next) {
        try {
            const { name, host, username, password, port, routerType } = req.body;
            const currentUser = { id: req.user?.id || "SYSTEM_ADMIN" };

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

            return successResponse({
                res,
                data: router,
                message: "Router created successfully",
                code: "ROUTER_CREATED",
                statusCode: 201
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================================================
    // Admin-level: Update Router
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
    // Admin-level: Delete Router
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
    // Admin-level: List Routers
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


    // ==================================================
    // Check Router Live Health & Metrics (Heartbeat)
    // ==================================================
    async checkStatus(req, res, next) {
        try {
            const { id } = req.params;
            const updatedRouter = await this.checkRouterStatus.execute(id);

            return res.status(200).json({
                success: true,
                status: updatedRouter.status,
                lastSeenAt: updatedRouter.lastSeenAt,
                lastError: updatedRouter.lastError
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================================================
    // Trigger Physical Hardware Reboot
    // ==================================================
    async reboot(req, res, next) {
        try {
            const { id } = req.params;
            const currentUser = { id: req.user?.id || null };

            const context = {
                actorId: currentUser.id,
                ip: req.ip,
                userAgent: req.get("User-Agent")
            };

            const result = await this.rebootRouter.execute(id, context);

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
        
    }

    async getProfiles(req, res, next) {
        try {
            const { id } = req.params;
            const { serviceType } = req.query;

            const profiles =
                await this.getRouterProfiles.execute(
                    id,
                    serviceType
                );

            return successResponse({
                res,
                data: profiles,
                message: "Router profiles fetched successfully",
                code: "ROUTER_PROFILES_FETCHED",
            });
        } catch (error) {
            next(error);
        }
    }

    async sync(req, res, next) {
        try {
            const { id } = req.params;

            const router =
                await this.syncRouterInfo.execute(id);

            return successResponse({
                res,
                data: router,
                message: "Router synchronized successfully",
                code: "ROUTER_SYNCED"
            });
        } catch (error) {
            next(error);
        }
    }
}