import { ObjectId } from "mongodb";

export async function up(db) {
    console.log("Running migration: 010-fix-skipped-subscriptions");

    const blankSubs = await db.collection("subscriptions").find({
        userId: { $exists: false },
        accountId: { $exists: false }
    }).toArray();

    console.log(`🔍 Found ${blankSubs.length} completely blank subscription placeholders to repair.`);
    let updatedCount = 0;

    const users = await db.collection("users").find({ subscription: { $exists: true } }).toArray();

    for (const sub of blankSubs) {
        const matchingUser = users.find(u => {
            const hasActiveAccount = db.collection("accounts").findOne({ userId: u._id });
            return hasActiveAccount;
        });

        const activeUser = users[updatedCount] || matchingUser;
        if (!activeUser) continue;

        const account = await db.collection("accounts").findOne({ userId: activeUser._id });
        if (!account) continue;

        const oldPlan = await db.collection("subscriptions").findOne({ _id: new ObjectId(activeUser.subscription) });
        const planNameStr = oldPlan ? oldPlan.planName : "UnlimitedLite";

        const newPlan = await db.collection("plans").findOne({ 
            name: { $regex: new RegExp(`^${planNameStr.trim()}$`, "i") } 
        });

        if (!newPlan) continue;

        const statusMap = { active: "active", expired: "expired", suspended: "suspended", none: "pending" };
        const status = statusMap[activeUser.subscriptionStatus] || "active";
        
        const durationDays = newPlan.durationValue || 30;
        const calculatedExpiry = activeUser.subscriptionEnd || new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

        await db.collection("subscriptions").updateOne(
            { _id: sub._id },
            {
                $set: {
                    accountId: account._id,
                    userId: activeUser._id,
                    planId: newPlan._id,
                    status: status,
                    planSnapshot: {
                        name: newPlan.name,
                        serviceType: newPlan.serviceType || "pppoe",
                        price: newPlan.price,
                        durationValue: newPlan.durationValue,
                        durationUnit: newPlan.durationUnit || "days",
                        speedRate: newPlan.speedRate,
                        mikrotikProfile: newPlan.mikrotikProfile,
                        devicesAllowed: newPlan.devicesAllowed || 1,
                        gracePeriodDays: newPlan.gracePeriodDays || 0
                    },
                    cycles: 1,
                    totalAmount: newPlan.price,
                    startsAt: activeUser.subscriptionStart || new Date(),
                    expiresAt: calculatedExpiry,
                    activatedAt: activeUser.subscriptionStart || new Date(),
                    currentPeriodStart: activeUser.subscriptionStart || new Date(),
                    currentPeriodEnd: calculatedExpiry,
                    nextRenewalDate: calculatedExpiry,
                    lastRenewedAt: activeUser.subscriptionStart || new Date(),
                    renewalStrategy: activeUser.cancelAtPeriodEnd ? "manual" : "auto_renew",
                    autoRenewEnabled: !activeUser.cancelAtPeriodEnd,
                    mikrotikStatus: activeUser.hotspotSynced ? "synced" : "pending",
                    mikrotikLastSyncAt: activeUser.lastSyncAt || null,
                    mikrotikError: activeUser.hotspotError || null,
                    events: [
                        {
                            type: "created",
                            date: new Date()
                        }
                    ],
                    updatedAt: new Date()
                }
            }
        );

        updatedCount++;
    }

    console.log(`🎉 Successfully repaired and filled blank subscription rows: ${updatedCount}`);
}
