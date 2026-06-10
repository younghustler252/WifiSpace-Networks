import { successResponse } from "../../../../shared/utils/api-response.js";

export class RouterAdminController {
    constructor({
        createRouter,
        updateRouter,
        deleteRouter,
        listRouters,
        checkRouterStatus,
        rebootRouter,
        syncRouterInfo,
    }) {
        this.createRouter = createRouter;
        this.updateRouter = updateRouter;
        this.deleteRouter = deleteRouter;
        this.listRouters = listRouters;
        this.checkRouterStatus = checkRouterStatus;
        this.rebootRouter = rebootRouter;
        this.syncRouterInfo = syncRouterInfo;
    }

    // ==================================================
    // Create Router
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
                    userAgent: req.get("User-Agent"),
                },
            });

            return successResponse({
                res,
                data: router,
                message: "Router created successfully",
                code: "ROUTER_CREATED",
                statusCode: 201,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================================================
    // Update Router
    // ==================================================
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const currentUser = { id: req.user?.id || "SYSTEM_ADMIN" };

            const updatedRouter = await this.updateRouter.execute(id, {
                ...updateData,
                actorId: currentUser.id,
            });

            return successResponse({
                res,
                data: updatedRouter,
                message: "Router updated successfully",
                code: "ROUTER_UPDATED",
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
                actorId: currentUser.id,
            });

            return successResponse({
                res,
                data: result,
                message: "Router deleted successfully",
                code: "ROUTER_DELETED",
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================================================
    // List Routers
    // ==================================================
    async list(req, res, next) {
        try {
            const routers = await this.listRouters.execute();

            return successResponse({
                res,
                data: routers,
                message: "Routers fetched successfully",
                code: "ROUTERS_FETCHED",
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================================================
    // Check Router Status
    // ==================================================
    async checkStatus(req, res, next) {
        try {
            const { id } = req.params;

            const router = await this.checkRouterStatus.execute(id);

            return res.status(200).json({
                success: true,
                status: router.status,
                lastSeenAt: router.lastSeenAt,
                lastError: router.lastError,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================================================
    // Reboot Router
    // ==================================================
    async reboot(req, res, next) {
        try {
            const { id } = req.params;
            const currentUser = { id: req.user?.id || null };

            const result = await this.rebootRouter.execute(id, {
                actorId: currentUser.id,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // ==================================================
    // Sync Router Info
    // ==================================================
    async sync(req, res, next) {
        try {
            const { id } = req.params;

            const router = await this.syncRouterInfo.execute(id);

            return successResponse({
                res,
                data: router,
                message: "Router synchronized successfully",
                code: "ROUTER_SYNCED",
            });
        } catch (error) {
            next(error);
        }
    }
}