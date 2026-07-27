

	import { RouterOSAPI } from "node-routeros";

const router = {
	host: "10.100.0.2",
	port: 8728,
	username: "billing",
    password: "Access@billing123$",

};

async function testMikrotik() {
	const conn = new RouterOSAPI({
		host: router.host,
		user: router.username,
		password: router.password,
		port: router.port,
		timeout: 10000,
	});

	try {
		console.log("Connecting to MikroTik...");
		console.log({
			host: router.host,
			port: router.port,
			username: router.username,
		});

		await conn.connect();

		console.log("✅ Connected");

		const identity = await conn.write(
			"/system/identity/print"
		);

		console.log("Identity:");
		console.dir(identity, { depth: null });

		const resource = await conn.write(
			"/system/resource/print"
		);

		console.log("Resource:");
		console.dir(resource, { depth: null });

		await conn.close();

		console.log("✅ Test completed");

	} catch (err) {

		console.error("❌ MikroTik connection failed");

		console.error("Error object:");
		console.dir(err, { depth: null });

		console.error("Name:", err?.name);
		console.error("Message:", err?.message);
		console.error("Stack:", err?.stack);

		try {
			await conn.close();
		} catch (closeErr) {
			console.error("Close error:");
			console.dir(closeErr, { depth: null });
		}
	}
}

testMikrotik();