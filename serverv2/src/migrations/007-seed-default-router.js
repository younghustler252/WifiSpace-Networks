export async function up(db) {
    console.log("Running migration: 007-seed-default-router");

    // 1. Re-verify or insert the exact live synced router document template
    let router = await db.collection("routers").findOne({ code: "RT-398359" });

    if (!router) {
        const routerPayload = {
            name: "Lagos Primary Core Edge Gateway", // Your updated professional title asset choice
            code: "RT-398359",
            host: "192.168.0.7",
            port: Number(process.env.ROUTEROS_PORT || 8728),
            username: process.env.ROUTEROS_USER || "billing",
            password: process.env.ROUTEROS_PASS || "Access@billing123$",
            ssl: false,
            routerUid: null,
            supportedServices: ["pppoe", "hotspot"],
            location: "Lagos Main POP Hub",
            siteCode: null,
            popName: "Main POP Router",
            status: "online",
            lastError: null,
            isEnabled: true,
            apiEnabled: true,
            lastSeenAt: new Date("2026-06-06T00:14:48.701Z"),
            lastProvisionSyncAt: new Date(),
            connectionType: "agent",
            connectorId: "LAGOS-001",
            maxSessions: 0,
            currentSessions: 134,
            agentLastSeenAt: null,
            agentStatus: "online",
            routerOsVersion: "6.49.17 (stable)",
            routerBoard: "RB951Ui-2HnD",
            systemIdentity: "WiFiBasespot",
            priority: 1,
            isDefaultRouter: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection("routers").insertOne(routerPayload);
        router = { _id: result.insertedId, ...routerPayload };
        console.log(`🎯 Synced Live Master Router initialized with ID: ${router._id}`);
    } else {
        console.log(`👉 Live Master Router record already verified with ID: ${router._id}`);
    }

    // 2. Reconciliation update: Link ALL existing accounts to this router if missing
    const updateResult = await db.collection("accounts").updateMany(
        { 
            $or: [
                { routerId: { $exists: false } },
                { routerId: null }
            ]
        },
        { $set: { routerId: router._id } }
    );

    console.log(`🔗 Core accounts linked and synced to primary edge routing system: ${updateResult.modifiedCount}`);
}
