// src/services/mikrotik.service.js
import { PPPoEIntegration } from "../infrastructure/mikrotik/PPPoEIntegration.js";
import { HotspotIntegration } from "../infrastructure/mikrotik/HotspotIntegration.js";
import { ValidationError } from "../shared/error/validation-error.js";

export class MikrotikService {
	constructor({ pppoeIntegration = new PPPoEIntegration(), hotspotIntegration = new HotspotIntegration() } = {}) {
		this.pppoeIntegration = pppoeIntegration;
		this.hotspotIntegration = hotspotIntegration;
	}

	// ----------------------------
	// Helper to select integration
	// ----------------------------
	_integrationFor(account) {
		if (!account || !account.serviceType) throw new ValidationError("Account or serviceType is missing");
		if (account.serviceType === "pppoe") return this.pppoeIntegration;
		if (account.serviceType === "hotspot") return this.hotspotIntegration;
		throw new ValidationError(`Unsupported serviceType: ${account.serviceType}`);
	}

	// ----------------------------
	// Create / Activate Account
	// ----------------------------
	async createAccount(account) {
		const integration = this._integrationFor(account);
		return integration.createUser({
			wsnId: account.wsnId,
			password: account.pppoePassword || account.hotspotPassword,
			profile: account.routerProfile
		});
	}

	// ----------------------------
	// Suspend Account
	// ----------------------------
	async suspendAccount(account) {
		const integration = this._integrationFor(account);
		return integration.suspendUser(account.wsnId);
	}

	// ----------------------------
	// Resume Account
	// ----------------------------
	async resumeAccount(account) {
		const integration = this._integrationFor(account);
		return integration.resumeUser(account.wsnId);
	}

	// ----------------------------
	// Remove / Cancel Account
	// ----------------------------
	async removeAccount(account) {
		const integration = this._integrationFor(account);
		return integration.removeUser(account.wsnId);
	}

	// ----------------------------
	// Update Profile / Plan
	// ----------------------------
	async updateAccountProfile(account, newProfile) {
		const integration = this._integrationFor(account);
		return integration.updateProfile(account.wsnId, newProfile);
	}

	// ----------------------------
	// Fetch Active Sessions
	// ----------------------------
	async fetchActiveSessions(serviceType = null) {
		if (serviceType === "pppoe") return this.pppoeIntegration.fetchActiveSessions();
		if (serviceType === "hotspot") return this.hotspotIntegration.fetchActiveSessions();
		// Both
		const pppoeSessions = await this.pppoeIntegration.fetchActiveSessions();
		const hotspotSessions = await this.hotspotIntegration.fetchActiveSessions();
		return [...pppoeSessions, ...hotspotSessions];
	}

	// ----------------------------
	// Fetch Last Seen
	// ----------------------------
	async fetchLastSeen(serviceType = null) {
		if (serviceType === "pppoe") return this.pppoeIntegration.fetchLastSeen();
		if (serviceType === "hotspot") return this.hotspotIntegration.fetchLastSeen();
		const pppoeLastSeen = await this.pppoeIntegration.fetchLastSeen();
		const hotspotLastSeen = await this.hotspotIntegration.fetchLastSeen();
		return [...pppoeLastSeen, ...hotspotLastSeen];
	}

	// ----------------------------
	// Other Helper Methods
	// ----------------------------

	// Example: Reset password
	async resetAccountPassword(account, newPassword) {
		const integration = this._integrationFor(account);
		return integration.updateProfile(account.wsnId, account.routerProfile, newPassword);
	}

    import { Payment } from "../../domain/entities/payment.entity.js";
import { ValidationError } from "../../../../shared/error/validation-error.js";
import { NotFoundError } from "../../../../shared/error/not-found.js";

export class ConfirmPaymentUseCase {
    constructor({ paymentRepository, paystackService, createSubscriptionUseCase, mikrotikService }) {
        this.paymentRepository = paymentRepository;             // PaymentRepositoryMongo
        this.paystackService = paystackService;                 // PaystackPaymentService
        this.createSubscriptionUseCase = createSubscriptionUseCase; // CreateSubscriptionUseCase
        this.mikrotikService = mikrotikService;                 // MikroTikService (PPPoE + Hotspot)
    }

    /**
     * Confirm a user's payment and provision subscription + PPPoE
     * @param {string} transactionId
     */
    async execute({ transactionId }) {
        if (!transactionId) throw new ValidationError("Transaction ID is required");

        // 1️⃣ Find payment by transaction
        const payments = await this.paymentRepository.findPayments({ transactionId });
        const payment = payments[0];
        if (!payment) throw new NotFoundError("Payment not found");

        // 2️⃣ Verify payment with Paystack
        const paystackResult = await this.paystackService.verifyPayment(transactionId);

        // 3️⃣ Update payment status
        if (paystackResult.status === "successful") {
            payment.markSuccessful();
            await this.paymentRepository.updateStatus(payment.id, payment.status);

            // 4️⃣ Create subscription
            const subscription = await this.createSubscriptionUseCase.execute({
                accountId: payment.accountId,
                planId: payment.planId
            });

            // 5️⃣ MikroTik provisioning (PPPoE)
            const account = payment.accountId; // Assuming payment.accountId points to Account object
            const wsId = account.wsnId;
            const password = account.pppoePassword || "defaultPass123"; // fallback password
            const profile = account.routerProfile || "default";

            // Check if MikroTik user already exists
            const existing = await this.mikrotikService.checkUserExists(wsId, account.serviceType);
            if (!existing) {
                await this.mikrotikService.createUser({
                    wsId,
                    password,
                    profile,
                    serviceType: account.serviceType
                });
            }

        } else if (paystackResult.status === "failed") {
            payment.markFailed();
            await this.paymentRepository.updateStatus(payment.id, payment.status);
        } else {
            payment.markPending();
            await this.paymentRepository.updateStatus(payment.id, payment.status);
        }

        return payment;
    }
}
}
