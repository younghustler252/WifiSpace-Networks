export async function up(db) {
    console.log("Running migration: 003-migrate-subscriptions");

    // 🚨 FIX: Drop the old unique legacy index so it stops blocking your inserts
    try {
        await db.collection("subscriptions").dropIndex("planName_1");
        console.log("👉 Dropped legacy unique index: planName_1");
    } catch (indexErr) {
        // If the index was already dropped or doesn't exist, ignore and move on
        console.log("👉 Note: legacy index planName_1 not present or already removed.");
    }

    const users = await db.collection("users").find({}).toArray();
    let created = 0;
    let skipped = 0;

    for (const user of users) {
        if (!user.subscription) {
            skipped++;
            continue;
        }

        const account = await db.collection("accounts").findOne({
            userId: user._id,
        });

        if (!account) {
            skipped++;
            continue;
        }

        const existingSubscription = await db.collection("subscriptions").findOne({
            accountId: account._id,
        });

        if (existingSubscription) {
            continue;
        }

        const oldPlan = await db.collection("subscriptions").findOne({
            _id: user.subscription,
        });

        if (!oldPlan) {
            skipped++;
            continue;
        }

        const newPlan = await db.collection("plans").findOne({
            name: oldPlan.planName,
        });

        if (!newPlan) {
            skipped++;
            continue;
        }

        const statusMap = {
            active: "active",
            expired: "expired",
            suspended: "suspended",
            none: "pending",
        };

        const status = statusMap[user.subscriptionStatus] || "pending";

        const fallbackDurationDays = newPlan.durationValue || oldPlan.durationDays || 30;
        const calculatedExpiry = user.subscriptionEnd || new Date(Date.now() + fallbackDurationDays * 24 * 60 * 60 * 1000);

        await db.collection("subscriptions").insertOne({
            accountId: account._id,
            userId: user._id,
            planId: newPlan._id,
            status,
            planSnapshot: {
                name: newPlan.name,
                serviceType: newPlan.serviceType,
                price: newPlan.price,
                durationValue: newPlan.durationValue,
                durationUnit: newPlan.durationUnit,
                speedRate: newPlan.speedRate,
                mikrotikProfile: newPlan.mikrotikProfile,
                devicesAllowed: newPlan.devicesAllowed,
                gracePeriodDays: newPlan.gracePeriodDays,
            },
            cycles: 1,
            totalAmount: newPlan.price,
            startsAt: user.subscriptionStart || null,
            expiresAt: calculatedExpiry,
            activatedAt: user.subscriptionStart || null,
            currentPeriodStart: user.subscriptionStart || null,
            currentPeriodEnd: calculatedExpiry,
            renewalStrategy: user.cancelAtPeriodEnd ? "manual" : "auto_renew",
            autoRenewEnabled: !user.cancelAtPeriodEnd,
            nextRenewalDate: calculatedExpiry,
            lastRenewedAt: user.subscriptionStart || null,
            bonusDays: 0,
            manualAdjustmentDays: 0,
            mikrotikStatus: user.hotspotSynced ? "synced" : "pending",
            mikrotikLastSyncAt: user.lastSyncAt || null,
            mikrotikError: user.hotspotError || null,
            events: [
                {
                    type: "created",
                    date: user.subscriptionStart || new Date(),
                },
            ],
            createdAt: user.createdAt || new Date(),
            updatedAt: new Date(),
        });

        created++;
    }

    console.log(`Subscriptions created: ${created}`);
    console.log(`Skipped: ${skipped}`);
}
