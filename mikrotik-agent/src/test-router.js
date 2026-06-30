import dotenv from "dotenv";
import { mikrotikService } from "./services/mikrotik.service.js";

dotenv.config();

async function inspectUser() {
	// 1. Structure the router credentials block using your target .env properties
	const routerConfig = {
		host: process.env.ROUTEROS_HOST || "192.168.0.7",
		username: process.env.ROUTEROS_USER || "billing",
		password: process.env.ROUTEROS_PASS || "Access@billing123$",
		port: parseInt(process.env.ROUTEROS_PORT || "8728", 10)
	};

	const targetUser = "HS0002";
	console.log(`📡 Connecting to MikroTik at ${routerConfig.host} using your service agent...`);

	try {
		// 2. Fire your exact executeCommand pipeline with the search parameters
		const response = await mikrotikService.executeCommand(
			routerConfig,
			"/ip/hotspot/user/print",
			[`?name=${targetUser}`]
		);

		console.log("\n==================================================");
		console.log(`📊 LIVE ROUTER STATE FOR USER: ${targetUser}`);
		console.log("==================================================");

		if (!response || response.length === 0) {
			console.log(`❌ User "${targetUser}" does NOT exist on this router.`);
		} else {
			// Print out the complete configuration payload array cleanly
			console.dir(response, { depth: null, colors: true });

			const userRecord = response[0];
			console.log("\n--------------------------------------------------");
			console.log(`📌 Username:      ${userRecord.name}`);
			console.log(`📌 Profile:       ${userRecord.profile || "default"}`);
			console.log(`📌 Limit Uptime:  ${userRecord["limit-uptime"] || "Unlimited / No Limit Set"}`);
			console.log(`📌 Bytes Out:     ${userRecord["bytes-out"] || "0"}`);
			console.log("--------------------------------------------------");
		}
		console.log("==================================================\n");

	} catch (error) {
		console.error("\n❌ INVENTORY CHECK FAILED:");
		console.error(error.message);
	}
}

// Execute the task sequence immediately
inspectUser();
