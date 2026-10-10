export class MikrotikManager {
	constructor({ accountRepository, routerRepository, hotspotService, pppoeService, routerProvisioningRepository }) {
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.hotspotService = hotspotService;
		this.pppoeService = pppoeService;
		this.routerProvisioningRepository = routerProvisioningRepository;
	}

	async provision(subscription, metadata = {}) {
    const { account, router } = await this.loadContext(subscription, metadata);

    const planSnapshot = subscription.planSnapshot || {};

    if (
        planSnapshot.mikrotikProfile &&
        account.routerProfile !== planSnapshot.mikrotikProfile
    ) {
        account.routerProfile = planSnapshot.mikrotikProfile;
        await this.accountRepository.update(account.id, account);
    }

    const service = this.getService(account);

    // STEP 1: Check whether the hotspot/PPPoE user exists
    console.log("[provisioning] Checking user", {
        username: account.wsnId,
        routerId: router.id,
        serviceType: account.serviceType,
    });

    let exists;

    try {
        exists = await service.userExists(router, account.wsnId);

        console.log("[provisioning] User existence check completed", {
            username: account.wsnId,
            exists,
        });
    } catch (error) {
        console.error("[provisioning] User existence check failed", {
            username: account.wsnId,
            error: error.message,
        });
        throw error;
    }

    // STEP 2: Create or update the user
    try {
        if (!exists) {
            console.log("[provisioning] Creating user", {
                username: account.wsnId,
            });

            await service.createUser(router, account);

            console.log("[provisioning] User creation command completed", {
                username: account.wsnId,
            });

            const confirmed = await this._waitForUser(
                service,
                router,
                account.wsnId
            );

            if (!confirmed) {
                throw new Error(
                    `User was not found after creation: ${account.wsnId}`
                );
            }
        } else {
            console.log("[provisioning] Updating existing user", {
                username: account.wsnId,
            });

            await service.updateUser(router, account);

            console.log("[provisioning] Resuming existing user", {
                username: account.wsnId,
            });

            await service.resumeUser(router, account.wsnId);
        }
    } catch (error) {
        console.error("[provisioning] Create/update/resume failed", {
            username: account.wsnId,
            error: error.message,
        });
        throw error;
    }

    // STEP 3: Handle IPoE/MAC-based access
    if (account.accessMethod === "ipoe" && account.macAddress) {
        console.log("[provisioning] Configuring IPoE MAC access", {
            username: account.wsnId,
            macAddress: account.macAddress,
        });

        await service.setUserMac(router, {
            username: account.wsnId,
            macAddress: account.macAddress,
        });

        await service.bindMac(router, {
            username: account.wsnId,
            macAddress: account.macAddress,
        });

        return {
            autoConnected: true,
            method: "mac_bypass",
        };
    }

    // STEP 4: Handle hotspot login
    if (account.serviceType === "hotspot") {
        if (!metadata.ipAddress) {
            console.log("[provisioning] No IP address; login skipped", {
                username: account.wsnId,
                routerId: router.id,
            });

            await this.routerProvisioningRepository.markSynced({
                accountId: account.id,
                subscriptionId: subscription.id,
                routerId: router.id,
            });

            return {
                autoConnected: false,
                method: "login_pending",
            };
        }

        console.log("[provisioning] Attempting hotspot login", {
            username: account.wsnId,
            routerId: router.id,
            ipAddress: metadata.ipAddress,
            hasPassword: Boolean(account.routerPassword),
        });

        try {
            const loginResult = await service.login(router, {
                username: account.wsnId,
                password: account.routerPassword,
                ipAddress: metadata.ipAddress,
            });

            console.log("[provisioning] Hotspot login succeeded", {
                username: account.wsnId,
                routerId: router.id,
            });

            await this.routerProvisioningRepository.markSynced({
                accountId: account.id,
                subscriptionId: subscription.id,
                routerId: router.id,
            });

            return {
                autoConnected: true,
                method: "login",
                data: loginResult,
            };
        } catch (error) {
            console.error("[provisioning] Hotspot login failed", {
                username: account.wsnId,
                routerId: router.id,
                ipAddress: metadata.ipAddress,
                hasPassword: Boolean(account.routerPassword),
                error: error.message,
            });

            throw error;
        }
    }

    // STEP 5: Non-hotspot service
    return {
        autoConnected: true,
        method: "ppp_secret",
    };
}


	async suspend(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata);
		const service = this.getService(account);

		await service.suspendUser(router, account.wsnId);
		await service.disconnectUser(router, account.wsnId);

		return { success: true };
	}
	async disconnect(subscription) {
		const { account, router } = await this.loadContext(subscription);
		return this.getService(account).disconnectUser(router, account.wsnId);
	}

	async remove(subscription) {
		const { account, router } = await this.loadContext(subscription);
		const service = this.getService(account);

		if (!service.removeUser) {
			return { success: true };
		}

		return service.removeUser(router, account.wsnId);
	}

	async changePassword(subscription, password) {
		const { account, router } = await this.loadContext(subscription);
		return this.getService(account).changePassword(router, account.wsnId, password);
	}

	async getProfiles(router, serviceType) {
		return this.resolveService(serviceType).getProfiles(router);
	}

	async getActiveSession(router, serviceType, username) {
		return this.resolveService(serviceType).getActiveSession(router, username);
	}

	async getActiveSessions(router, serviceType) {
		return this.resolveService(serviceType).getActiveSessions(router);
	}

	async loadContext(subscription, metadata = {}) {
    const account = await this.accountRepository.findById(
        subscription.accountId
    );

    if (!account) {
        throw new Error("Account not found");
    }

    const routerId = metadata.routerId || account.routerId;

    if (!routerId) {
        throw new Error(
            account.serviceType === "hotspot"
                ? "Router ID is required for hotspot provisioning"
                : "Account has no router assigned"
        );
    }

    const router = await this.routerRepository.findById(routerId);

    if (!router) {
        throw new Error("Router not found");
    }

    console.log("[DEBUG] Account credentials loaded", {
        accountId: account.id,
        username: account.wsnId,
        hasPasswordOnAccount: Boolean(account.routerPassword),
        passwordType: typeof account.routerPassword,
        passwordLength:
            typeof account.routerPassword === "string"
                ? account.routerPassword.length
                : null,
        routerId: router.id,
    });

	console.log("account password", account.routerPassword)

    if (!account.routerPassword) {
        console.log("[DEBUG] Looking up stored account credentials", {
            accountId: account.id,
        });

        const credentials =
            await this.accountRepository.findRouterCredentials(account.id);

        console.log("[DEBUG] Credential lookup result", {
            accountId: account.id,
            credentialsFound: Boolean(credentials),
            passwordFieldExists:
                credentials?.routerPassword !== undefined,
            passwordIsNull:
                credentials?.routerPassword === null,
            passwordType: typeof credentials?.routerPassword,
            passwordLength:
                typeof credentials?.routerPassword === "string"
                    ? credentials.routerPassword.length
                    : null,
        });

        account.routerPassword = credentials?.routerPassword ?? null;
    }

    console.log("[DEBUG] Final hotspot credentials", {
        accountId: account.id,
        username: account.wsnId,
        passwordPresent: Boolean(account.routerPassword),
        passwordLength:
            typeof account.routerPassword === "string"
                ? account.routerPassword.length
                : null,
    });

    if (
        account.serviceType === "hotspot" &&
        !account.routerPassword
    ) {
        throw new Error(
            `Missing hotspot password for account ${account.id}`
        );
    }

    return { account, router };
}

	async resume(subscription, metadata = {}) {
		const { account, router } = await this.loadContext(subscription, metadata);
		const service = this.getService(account);

		await service.resumeUser(router, account.wsnId);

		if (account.serviceType === "hotspot" && metadata.ipAddress) {
			const loginResult = await service.login(router, { username: account.wsnId, password: account.routerPassword, ipAddress: metadata.ipAddress });
			return { autoConnected: true, method: "login", data: loginResult };
		}

		return { autoConnected: false, method: "resume_user" };
	}

	resolveService(type) {
		switch (type) {
			case "hotspot":
				return this.hotspotService;
			case "pppoe":
				return this.pppoeService;
			default:
				throw new Error(`Unsupported service type: ${type}`);
		}
	}

	getService(account) {
		if (account.serviceType === "hotspot") return this.hotspotService;
		if (account.serviceType === "pppoe" && account.accessMethod === "ipoe") return this.hotspotService;
		return this.pppoeService;
	}

	async _waitForUser(service, router, username, attempts = 5, delayMs = 400) {
		for (let i = 0; i < attempts; i++) {
			const exists = await service.userExists(router, username);
			if (exists) return true;
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}

		return false;
	}
}
