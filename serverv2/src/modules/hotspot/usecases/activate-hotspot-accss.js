export class ActivateHotspotAccess {
	constructor({
		accountRepository,
		routerRepository,
		mikrotikService
	}) {
		this.accountRepository = accountRepository;
		this.routerRepository = routerRepository;
		this.mikrotikService = mikrotikService;
	}

	async execute({
		accountId,
		routerId,
		macAddress,
		hostname,
		ipAddress
	}) {
		console.log("\n========================================================");
		console.log("🔥 [ACTIVATE HOTSPOT LOG] Execution Triggered!");
		console.log("➡️ INPUT PARAMETERS:", { accountId, routerId, macAddress, hostname, ipAddress });
		console.log("========================================================");

		if (!accountId) throw new Error("Account ID required");
		if (!macAddress) throw new Error("MAC address required");

		// Fetch Data
		const account = await this.accountRepository.findById(accountId);
		if (!account) {
			console.error(`❌ [ACTIVATE HOTSPOT ERROR] Account not found in MongoDB for ID: ${accountId}`);
			throw new Error("Account not found");
		}

		console.log("📦 [MONGODB DATA] Account Document Found:", {
			id: account.id || account._id,
			wsnId: account.wsnId,
			routerPassword: account.routerPassword ? `*** (${account.routerPassword.length} chars)` : "NULL/EMPTY",
			rawPasswordValue: account.routerPassword, // 🎯 Directly visible to inspect spaces/fallbacks
			serviceType: account.serviceType,
			profileStatus: account.profileStatus,
			routerIdOnAccount: account.routerId
		});

		const router = routerId
			? await this.routerRepository.findById(routerId)
			: await this.routerRepository.findById(account.routerId);
		if (!router) {
			console.error(`❌ [ACTIVATE HOTSPOT ERROR] Target Router not found for ID: ${routerId || account.routerId}`);
			throw new Error("Router not found");
		}

		console.log("⚙️ [ROUTER DATA] Connecting to Router profile:", {
			id: router.id || router._id,
			host: router.host || router.ipAddress,
			connectorId: router.connectorId || "N/A"
		});

		// Manage Devices
		const devices = account.devices || [];
		const existing = devices.find(d => d.macAddress === macAddress);

		console.log(`📱 [DEVICE MATCH] Checking incoming MAC (${macAddress}) against database array...`);
		if (existing) {
			console.log(`✅ [DEVICE MATCH] Existing device record matched:`, existing);
			existing.lastSeenAt = new Date();
			existing.ipAddress = ipAddress;
		} else {
			console.log(`➕ [DEVICE MATCH] No device found. Appending new device object to account array.`);
			devices.push({
				macAddress,
				hostname,
				ipAddress,
				lastSeenAt: new Date()
			});
		}

		// Save modifications safely
		const plainAccount = typeof account.toObject === "function" ? account.toObject() : account;
		await this.accountRepository.update(account.id || account._id, {
			...plainAccount,
			devices
		});
		console.log("💾 [MONGODB WRITE] Account device timeline logs flushed to DB.");

		// Router Sync Phase
		try {
			console.log(`\n🔍 [MIKROTIK INTERACTION] Running checkUserExists on router for username: "${account.wsnId}"`);
			const userExists = await this.mikrotikService.checkUserExists(account, router);
			
			console.log(`📡 [MIKROTIK RESPONSE] Does User exist on MikroTik database?:`, userExists);

			if (userExists) {
				console.log(`🔄 [MIKROTIK SYNC] User exists. Overwriting router profile configuration settings...`);
				await this.mikrotikService.updateAccount(account, router);
			} else {
				console.log(`🆕 [MIKROTIK SYNC] User does NOT exist on router hardware. Invoking createAccount...`);
				console.log(`➡️ PUSHING PROFILE TO HARDWARE:`, {
					username: account.wsnId,
					password: account.routerPassword,
					profile: account.routerProfile || "default"
				});
				await this.mikrotikService.createAccount(account, router);
			}
		} catch (dbError) {
			console.error("❌ [MIKROTIK SYNC CRASH] Failed to synchronize account state with Router database tier:", dbError);
			throw new Error(`Failed to establish user credentials on router database table: ${dbError.message}`);
		}

		// Provision Access Phase
		try {
			const loginPayload = {
				username: account.wsnId,
				password: account.routerPassword,
				macAddress,
				ipAddress
			};

			console.log(`\n🚀 [MIKROTIK LOGIN] Attempting provisionAccess / IP Bypass authentication sequence...`);
			console.log(`➡️ EXACT LOGIN PAYLOAD DISPATCHED:`, loginPayload);

			const result = await this.mikrotikService.provisionAccess(
				account,
				router,
				loginPayload
			);

			console.log("🎉 [MIKROTIK SUCCESS] Session authentication acknowledged by router:", result);
			console.log("========================================================\n");
			return result;
		} catch (err) {
			console.error("\n💥 [MIKROTIK LOGIN FATAL] The router rejected this hotspot session authentication attempt!");
			console.error("❌ ERROR MESSAGE DETAILS:", err.message);
			console.error("📋 VERIFY THESE TWO STRINGS MATCH THE MIKROTIK USER DATABASE MANUALLY:");
			console.error(`   👉 Username Sent: "${account.wsnId}"`);
			console.error(`   👉 Password Sent: "${account.routerPassword}"`);
			console.error("========================================================\n");
			throw new Error("Hotspot session activation failed: " + err.message);
		}
	}
}
