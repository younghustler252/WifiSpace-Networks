export async function up(db) {
    console.log("Running migration: 009-patch-payment-enums");

    // 1. Repair status strings ("success" -> "successful", "initiated" -> "pending" / "initiated")
    const successResult = await db.collection("payments").updateMany(
        { status: "success" },
        { $set: { status: "successful", isWebhookProcessed: true, businessProcessed: true } }
    );
    console.log(`🔹 Fixed payment statuses to successful: ${successResult.modifiedCount}`);

    const initiatedResult = await db.collection("payments").updateMany(
        { status: "initiated" },
        { $set: { status: "pending" } } // Shifts initiated fallback records into active validation rules
    );
    console.log(`🔹 Fixed initiated statuses to pending: ${initiatedResult.modifiedCount}`);

    // 2. Repair action types ("purchase" / "renew" -> "new_subscription" / "renewal")
    const purchaseAction = await db.collection("payments").updateMany(
        { actionType: "purchase" },
        { $set: { actionType: "new_subscription" } }
    );
    console.log(`🔹 Remapped actionType purchase to new_subscription: ${purchaseAction.modifiedCount}`);

    const renewAction = await db.collection("payments").updateMany(
        { actionType: "renew" },
        { $set: { actionType: "renewal" } }
    );
    console.log(`🔹 Remapped actionType renew to renewal: ${renewAction.modifiedCount}`);

    // 3. Repair payment channel strings ("bank" -> "bank_transfer", "other" -> "cash")
    const bankChannel = await db.collection("payments").updateMany(
        { paymentChannel: "bank" },
        { $set: { paymentChannel: "bank_transfer" } }
    );
    console.log(`🔹 Remapped paymentChannel bank to bank_transfer: ${bankChannel.modifiedCount}`);

    const otherChannel = await db.collection("payments").updateMany(
        { paymentChannel: "other" },
        { $set: { paymentChannel: "cash" } }
    );
    console.log(`🔹 Remapped paymentChannel other to cash: ${otherChannel.modifiedCount}`);

    console.log("🎉 Payment ENUM compliance remediation patch complete.");
}
