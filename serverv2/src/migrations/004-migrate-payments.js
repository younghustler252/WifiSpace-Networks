export async function up(db) {
    console.log("Running migration: 004-migrate-payments");

    // 🚨 FIX: Drop the old unique legacy index so it stops blocking your unsets
    try {
        await db.collection("payments").dropIndex("transactionId_1");
        console.log("👉 Dropped legacy unique index: transactionId_1");
    } catch (indexErr) {
        // If the index doesn't exist or was already removed, ignore and continue
        console.log("👉 Note: legacy index transactionId_1 not present or already removed.");
    }

    const oldPayments = await db.collection("payments").find({}).toArray();
    let created = 0;
    let skipped = 0;

    for (const oldPay of oldPayments) {
        if (oldPay.amount && typeof oldPay.amount === "object" && oldPay.amount.total !== undefined) {
            continue;
        }

        const account = await db.collection("accounts").findOne({
            userId: oldPay.userId
        });

        const newPlan = await db.collection("plans").findOne({
            name: oldPay.planName
        });

        if (!newPlan) {
            skipped++;
            continue;
        }

        const subscription = await db.collection("subscriptions").findOne({
            accountId: account ? account._id : null,
            planId: newPlan._id
        });

        const statusMap = {
            successful: "success",
            pending: "initiated",
            failed: "failed",
            expired: "failed"
        };
        const normalizedStatus = statusMap[oldPay.status] || "initiated";

        const channelMap = {
            paystack: "card",
            wallet: "other",
            bank_transfer: "bank"
        };
        const normalizedChannel = channelMap[oldPay.method] || "other";

        const rawAmount = Number(oldPay.amount || 0);

        const newPaymentDoc = {
            userId: oldPay.userId,
            accountId: account ? account._id : null,
            subscriptionId: subscription ? subscription._id : null,
            actionType: oldPay.monthsPaid > 1 || oldPay.bonusDays > 0 ? "renew" : "purchase",
            amount: {
                total: rawAmount,
                base: rawAmount,
                discount: 0
            },
            currency: "NGN",
            status: normalizedStatus,
            paymentChannel: normalizedChannel,
            gateway: oldPay.method === "paystack" ? "paystack" : "manual",
            gatewayReference: oldPay.transactionId || null,
            idempotencyKey: null,
            isWebhookProcessed: normalizedStatus === "success",
            businessProcessed: normalizedStatus === "success",
            planId: newPlan._id,
            cycles: Number(oldPay.monthsPaid || 1),
            metadata: oldPay.paymentDetails || {},
            paymentDate: oldPay.paymentDate || oldPay.createdAt || new Date(),
            processedAt: normalizedStatus === "success" ? (oldPay.paymentDate || oldPay.updatedAt) : null,
            failedAt: normalizedStatus === "failed" ? oldPay.updatedAt : null,
            failureReason: normalizedStatus === "failed" ? "Transaction declined or expired context" : null,
            createdAt: oldPay.createdAt || new Date(),
            updatedAt: oldPay.updatedAt || new Date()
        };

        await db.collection("payments").updateOne(
            { _id: oldPay._id },
            { 
                $set: newPaymentDoc,
                $unset: {
                    wsnId: "",
                    planName: "",
                    monthsPaid: "",
                    bonusDays: "",
                    method: "",
                    transactionId: "",
                    subscriptionStartDate: "",
                    subscriptionEndDate: "",
                    paymentDetails: ""
                }
            }
        );

        created++;
    }

    console.log(`Payments updated and re-mapped: ${created}`);
    console.log(`Skipped due to unmapped plan names: ${skipped}`);
}
