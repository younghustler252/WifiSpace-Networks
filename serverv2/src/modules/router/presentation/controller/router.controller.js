import mongoose from "mongoose";
import { successResponse } from "../../../../shared/utils/api-response.js";

export class RouterController {
    constructor({
        // Account / Subscription-level
        createRouterAccount,
        provisionNetworkAccount,
        suspendNetworkAccount,
        resumeNetworkAccount,
        checkRouterStatus,
        rebootRouter,
        getRouterProfiles,
        // Admin-level
        createRouter,
        updateRouter,
        deleteRouter,
        listRouters,
    }) {
        // Account / Subscription-level
        this.createRouterAccount = createRouterAccount;
        this.provisionNetworkAccount = provisionNetworkAccount;
        this.suspendNetworkAccount = suspendNetworkAccount;
        this.resumeNetworkAccount = resumeNetworkAccount;
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
    // Provision / Create User Profile on Hardware (Account-level)
    // ==================================================
    async createAccount(req, res, next) {
        try {
            const { accountId } = req.body;
            const currentUser = { id: req.user?._id || new mongoose.Types.ObjectId() };
            // console.log(req.user)
            const context = {
                actorId: currentUser.id,
                ip: req.ip,
                userAgent: req.get("User-Agent")
            };

            const result = await this.createRouterAccount.execute(accountId, context);

            return successResponse({
                res,
                data: result,
                message: `Router account created successfully`,
                code: "ROUTER_ACCOUNT_CREATED",
                statusCode: 200
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================================================
    // Provision Subscription on Network Hardware
    // ==================================================
    async provisionSubscription(req, res, next) {
        try {
            const { subscriptionId } = req.body;
            const currentUser = { id: req.user?.id || null };

            const context = {
                actorId: currentUser.id,
                ip: req.ip,
                userAgent: req.get("User-Agent")
            };

            const result = await this.provisionNetworkAccount.execute(subscriptionId, context);

            return successResponse({
                res,
                data: result,
                message: "Subscription provisioned successfully",
                code: "SUBSCRIPTION_PROVISIONED",
                statusCode: 200
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================================================
    // Suspend Active Account
    // ==================================================
    async suspend(req, res, next) {
        try {
            const { accountId, reason } = req.body;
            const currentUser = { id: req.user?.id || null };

            const context = {
                actorId: currentUser.id,
                ip: req.ip,
                userAgent: req.get("User-Agent")
            };

            const result = await this.suspendNetworkAccount.execute(accountId, reason, context);

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // ==================================================
    // Resume Suspended Account
    // ==================================================
    async resume(req, res, next) {
        try {
            const { accountId } = req.body;
            const currentUser = { id: req.user?.id || null };

            const context = {
                actorId: currentUser.id,
                ip: req.ip,
                userAgent: req.get("User-Agent")
            };

            const result = await this.resumeNetworkAccount.execute(accountId, context);

            return res.status(200).json(result);
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