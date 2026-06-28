export async function up(db) {
    console.log("Running migration: 005-migrate-transactions");

    // 1. Pull records from the legacy separate "transactions" collection
    const oldTransactions = await db.collection("transactions").find({}).toArray();
    let created = 0;
    let skipped = 0;

    for (const oldTx of oldTransactions) {
        // Find their new structural Account Document
        const account = await db.collection("accounts").findOne({
            userId: oldTx.userId
        });

        // Pull the legacy plan to extract its string name
        const legacyPlan = await db.collection("subscriptions").findOne({
            _id: oldTx.subscriptionPlan
        });

        if (!legacyPlan) {
            skipped++;
            continue;
        }

        // Link to your brand new Plan ID inside the new collection template
        const newPlan = await db.collection("plans").findOne({
            name: legacyPlan.planName
        });

        if (!newPlan) {
            skipped++;
            continue;
        }

        // Locate the active subscription link tracking context
        const subscription = await db.collection("subscriptions").findOne({
            accountId: account ? account._id : null,
            planId: newPlan._id
        });

        const statusMap = {
            successful: "success",
            pending: "initiated",
            failed: "failed"
        };
        const normalizedStatus = statusMap[oldTx.paymentStatus] || "initiated";

        const channelMap = {
            flutterwave: "card",
            wallet: "other",
            bank_transfer: "bank"
        };
        const normalizedChannel = channelMap[oldTx.paymentMethod] || "other";

        const rawAmount = Number(oldTx.amount || 0);

        // Build the new consolidated Payment instance payload map
        const newPaymentDoc = {
            userId: oldTx.userId,
            accountId: account ? account._id : null,
            subscriptionId: subscription ? subscription._id : null,
            actionType: "purchase", // Defaulting to base purchase context
            amount: {
                total: rawAmount,
                base: rawAmount,
                discount: 0
            },
            currency: "NGN",
            status: normalizedStatus,
            paymentChannel: normalizedChannel,
            gateway: oldTx.paymentMethod === "flutterwave" ? "flutterwave" : "manual",
            gatewayReference: oldTx.transactionId || null,
            idempotencyKey: null,
            isWebhookProcessed: normalizedStatus === "success",
            businessProcessed: normalizedStatus === "success",
            planId: newPlan._id,
            cycles: 1, // Defaulting context since legacy transactions didn't store cycle multipliers
            metadata: oldTx.paymentDetails || {},
            paymentDate: oldTx.paymentDate || oldTx.createdAt || new Date(),
            processedAt: normalizedStatus === "success" ? (oldTx.paymentDate || new Date()) : null,
            failedAt: normalizedStatus === "failed" ? (oldTx.paymentDate || new Date()) : null,
            failureReason: normalizedStatus === "failed" ? "Transaction declined via Flutterwave/Bank" : null,
            createdAt: oldTx.createdAt || oldTx.paymentDate || new Date(),
            updatedAt: oldTx.updatedAt || new Date()
        };

        // Insert directly into your unified "payments" collection
        await db.collection("payments").insertOne(newPaymentDoc);
        created++;
    }

    console.log(`Transactions successfully consolidated into Payments: ${created}`);
    console.log(`Skipped due to unmapped/missing plan links: ${skipped}`);
}
