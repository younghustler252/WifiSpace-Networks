export async function up(db) {
    console.log("Running migration: 002-migrate-accounts");

    const users = await db.collection("users").find({}).toArray();

    let created = 0;
    let skipped = 0;

    for (const user of users) {
        if (!user.wsnId) {
            skipped++;
            continue;
        }

        const existing = await db.collection("accounts").findOne({
            userId: user._id,
        });

        if (existing) continue;

        const profileStatus =
            user.subscriptionStatus === "active"
                ? "active"
                : "pending";

        const devices = [];

        if (user.macAddress) {
            devices.push({
                macAddress: user.macAddress.toUpperCase(),
            });
        }

        await db.collection("accounts").insertOne({
            userId: user._id,

            accountType: "personal",

            wsnId: user.wsnId,

            routerPassword: user.routerPassword || null,

            routerProfile: user.routerProfile || "default",

            serviceType: "pppoe",

            profileStatus,

            devices,

            routerProvision: {
                status: user.hotspotSynced
                    ? "synced"
                    : "pending",

                lastError: user.hotspotError || null,

                lastAttemptAt: user.lastSyncAt || null,
            },

            limitUptime: "0",

            createdAt: user.createdAt || new Date(),
            updatedAt: new Date(),
        });

        created++;
    }

    console.log(`Accounts created: ${created}`);
    console.log(`Skipped users: ${skipped}`);
}                                                                           