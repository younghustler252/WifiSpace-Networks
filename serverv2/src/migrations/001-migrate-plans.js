export async function up(db) {
    console.log("Running migration: 001-migrate-plans");

    const legacyPlans = await db
        .collection("subscriptions")
        .find({})
        .toArray();

    let created = 0;

    for (const oldPlan of legacyPlans) {
        const existing = await db.collection("plans").findOne({
            name: oldPlan.planName,
            serviceType: "pppoe",
        });

        if (existing) continue;

        await db.collection("plans").insertOne({
            name: oldPlan.planName,

            accountType: "personal",

            price: oldPlan.price,

            speedRate: oldPlan.speedRate,

            durationValue: oldPlan.durationDays || 30,

            durationUnit: "days",

            dataLimitBytes: 0,

            devicesAllowed: oldPlan.devicesAllowed || 1,

            features: oldPlan.features || [],

            mikrotikProfile: oldPlan.mikrotikProfile,

            gracePeriodDays: 0,

            status: "active",

            serviceType: "pppoe",

            bonusRules: [],

            createdAt: oldPlan.createdAt || new Date(),
            updatedAt: oldPlan.updatedAt || new Date(),
        });

        created++;
    }

    console.log(`Plans migrated: ${created}`);
}