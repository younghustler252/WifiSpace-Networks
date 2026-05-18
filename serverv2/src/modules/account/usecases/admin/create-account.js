import { Account } from "../../domain/account.entity.js";
import { PROFILE_STATUSES } from "../../domain/account.enum.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class CreateAccount {

	constructor(
		accountRepository,
		permissionService,
		auditService,
		analyticsTracker,
		createRouterAccountUseCase // NEW: Inject the router creation use case
	) {
		this.accountRepository = accountRepository;
		this.permissionService = permissionService;
		this.auditService = auditService;
		this.analyticsTracker = analyticsTracker;
		this.createRouterAccountUseCase = createRouterAccountUseCase;
	}

	async execute(currentUser, data, context = {}) {
    // ----------------------------
    // Create Domain Entity
    // ----------------------------
    const account = new Account({ ...data });

    // ----------------------------
    // Set profile status
    // ----------------------------
    account.profileStatus = PROFILE_STATUSES.ACTIVE;

    // ----------------------------
    // Persist Account
    // ----------------------------
    const createdAccount = await this.accountRepository.create(account);

    let routerResult = null;

    // ----------------------------
    // Provision Router Account
    // ----------------------------
    if (createdAccount.routerId && createdAccount.routerPassword) {
        try {
            routerResult = await this.createRouterAccountUseCase.execute(createdAccount.id, context);
        } catch (err) {
            console.error("Router provisioning failed:", err.message);
            routerResult = {
                success: false,
                message: err.message
            };
        }
    }

    // ----------------------------
    // Audit Log
    // ----------------------------
    await this.auditService.log({
        actorId: currentUser.id,
        action: "ACCOUNT_CREATED",
        targetId: createdAccount.id,
        resource: "Account",
        metadata: {
            accountType: createdAccount.accountType,
            userId: createdAccount.userId,
            wsnId: createdAccount.wsnId
        },
        ip: context.ip,
        userAgent: context.userAgent
    });

    // ----------------------------
    // Analytics Tracking
    // ----------------------------
    try {
        await this.analyticsTracker.track(ANALYTICS_EVENTS.ACCOUNT_CREATED, {
            accountType: createdAccount.accountType,
            serviceType: createdAccount.serviceType,
            profileStatus: createdAccount.profileStatus
        });
    } catch (err) {
        console.error("Analytics tracking failed:", { event: "ACCOUNT_CREATED", error: err.message });
    }

    // ----------------------------
    // Return both account and router provisioning result
    // ----------------------------
    return {
        account: createdAccount,
        routerProvision: routerResult
    };
}
}