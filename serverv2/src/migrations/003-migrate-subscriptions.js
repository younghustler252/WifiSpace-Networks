export async function up(db) {
    console.log("Running migration: 003-migrate-subscriptions");

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

        const existingSubscription =
            await db.collection("subscriptions").findOne({
                accountId: account._id,
            });

        if (existingSubscription) {
            continue;
        }

        const oldPlan =
            await db.collection("subscriptions").findOne({
                _id: user.subscription,
            });

        if (!oldPlan) {
            skipped++;
            continue;
        }

        const newPlan =
            await db.collection("plans").findOne({
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

        const status =
            statusMap[user.subscriptionStatus] || "pending";

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

                mikrotikProfile:
                    newPlan.mikrotikProfile,

                devicesAllowed:
                    newPlan.devicesAllowed,

                gracePeriodDays:
                    newPlan.gracePeriodDays,
            },

            cycles: 1,

            totalAmount: newPlan.price,

            startsAt:
                user.subscriptionStart || null,

            expiresAt:
                user.subscriptionEnd || new Date(),

            activatedAt:
                user.subscriptionStart || null,

            currentPeriodStart:
                user.subscriptionStart || null,

            currentPeriodEnd:
                user.subscriptionEnd || null,

            renewalStrategy:
                user.cancelAtPeriodEnd
                    ? "manual"
                    : "auto_renew",

            autoRenewEnabled:
                !user.cancelAtPeriodEnd,

            nextRenewalDate:
                user.subscriptionEnd || null,

            lastRenewedAt:
                user.subscriptionStart || null,

            bonusDays: 0,

            manualAdjustmentDays: 0,

            mikrotikStatus:
                user.hotspotSynced
                    ? "synced"
                    : "pending",

            mikrotikLastSyncAt:
                user.lastSyncAt || null,

            mikrotikError:
                user.hotspotError || null,

            events: [
                {
                    type: "created",
                    date:
                        user.subscriptionStart ||
                        new Date(),
                },
            ],

            createdAt:
                user.createdAt || new Date(),

            updatedAt: new Date(),
        });

        created++;
    }

    console.log(`Subscriptions created: ${created}`);
    console.log(`Skipped: ${skipped}`);
}