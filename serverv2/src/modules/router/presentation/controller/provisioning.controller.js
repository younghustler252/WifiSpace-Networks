import mongoose from "mongoose";
import { successResponse } from "../../../../shared/utils/api-response.js";

export class RouterProvisioningController {
    constructor({
        createRouterAccount,
        provisionNetworkAccount,
        suspendNetworkAccount,
        resumeNetworkAccount,
        getRouterProfiles,
    }) {
        this.createRouterAccount = createRouterAccount;
        this.provisionNetworkAccount = provisionNetworkAccount;
        this.suspendNetworkAccount = suspendNetworkAccount;
        this.resumeNetworkAccount = resumeNetworkAccount;
        this.getRouterProfiles = getRouterProfiles;
    }

    // ==================================================
    // Create Router Account
    // ==================================================
    async createAccount(req, res, next) {
        try {
            const { accountId } = req.body;
            const currentUser = { id: req.user?._id || new mongoose.Types.ObjectId() };

            const context = {
                actorId: currentUser.id,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            };

            const result = await this.createRouterAccount.execute(accountId, context);

            return successResponse({
                res,
                data: result,
                message: "Router account created successfully",
                code: "ROUTER_ACCOUNT_CREATED",
                statusCode: 200,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================================================
    // Provision Subscription
    // ==================================================
    async provisionSubscription(req, res, next) {
        try {
            const { subscriptionId } = req.body;
            const currentUser = { id: req.user?.id || null };

            const context = {
                actorId: currentUser.id,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            };

            const result = await this.provisionNetworkAccount.execute(
                subscriptionId,
                context
            );

            return successResponse({
                res,
                data: result,
                message: "Subscription provisioned successfully",
                code: "SUBSCRIPTION_PROVISIONED",
                statusCode: 200,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================================================
    // Suspend Account
    // ==================================================
    async suspend(req, res, next) {
        try {
            const { accountId, reason } = req.body;
            const currentUser = { id: req.user?.id || null };

            const context = {
                actorId: currentUser.id,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            };

            const result = await this.suspendNetworkAccount.execute(
                accountId,
                reason,
                context
            );

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // ==================================================
    // Resume Account
    // ==================================================
    async resume(req, res, next) {
        try {
            const { accountId } = req.body;
            const currentUser = { id: req.user?.id || null };

            const context = {
                actorId: currentUser.id,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            };

            const result = await this.resumeNetworkAccount.execute(
                accountId,
                context
            );

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // ==================================================
    // Get Router Profiles
    // ==================================================
    async getProfiles(req, res, next) {
        try {
            const { id } = req.params;
            const { serviceType } = req.query;

            const profiles = await this.getRouterProfiles.execute(
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
}