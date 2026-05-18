import mongoose from "mongoose";
import { successResponse } from "../../../../shared/utils/api-response.js";

export class RouterController {
    constructor({ 
        createRouterAccount, 
        provisionNetworkAccount,
        suspendNetworkAccount, 
        resumeNetworkAccount, 
        checkRouterStatus,
        rebootRouter 
    }) {
        this.createRouterAccount = createRouterAccount;
        this.provisionNetworkAccount = provisionNetworkAccount;
        this.suspendNetworkAccount = suspendNetworkAccount;
        this.resumeNetworkAccount = resumeNetworkAccount;
        this.checkRouterStatus = checkRouterStatus;
        this.rebootRouter = rebootRouter;
    }

    // ==================================================
    // Provision / Create User Profile on Hardware (Account-level)
    // ==================================================
    async createAccount(req, res, next) {
        try {
            const { accountId } = req.body;
           const currentUser = { id: req.user?._id || new mongoose.Types.ObjectId() };

            // const context = {
            //     actorId: currentUser.id,
            //     ip: req.ip,
            //     userAgent: req.get("User-Agent")
            // };

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
    // Provision Subscription on Network Hardware (Subscription-level)
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
}