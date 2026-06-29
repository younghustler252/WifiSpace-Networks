export async function up(db) {
    console.log("Running migration: 003-backfill-router-passwords (Updated Rule Matcher)");

    // 1. Find accounts missing a password OR holding the old invalid default string fallback parameter
    const accounts = await db.collection("accounts").find({
        $or: [
            { routerPassword: null },
            { routerPassword: "" },
            { routerPassword: { $exists: false } },
            { routerPassword: "access@C0NN3CT@pppoe123$" }
        ]
    }).toArray();

    console.log(`Found ${accounts.length} profiles requiring password realignment.`);

    let updated = 0;
    let fallbackUsed = 0;

    for (const account of accounts) {
        // 2. Locate the owner user document to find their phone number
        const user = await db.collection("users").findOne({ _id: account.userId });

        let targetPassword = "";
        let rawPhone = user?.phoneNumber ?? user?.phone ?? "";

        // ✅ FIX: Force convert the phone to a string first to prevent number format crashes
        const userPhone = String(rawPhone).trim();

        // Ensure it's not just an empty string container or "undefined" text representation
        if (userPhone && userPhone !== "" && userPhone !== "undefined" && userPhone !== "null") {
            targetPassword = userPhone;
        } else {
            // 3. Apply the exact matching fallback strings based on service type layout
            if (account.serviceType === "hotspot") {
                targetPassword = "Access123";
            } else {
                targetPassword = "C0NN3CT@pppoe123$";
            }
            fallbackUsed++;
        }

        // 4. Update the specific account record inline
        await db.collection("accounts").updateOne(
            { _id: account._id },
            {
                $set: {
                    routerPassword: targetPassword,
                    updatedAt: new Date()
                }
            }
        );

        updated++;
    }

    console.log(`Successfully completed password realignment backfill.`);
    console.log(`Total accounts updated: ${updated}`);
    console.log(`Accounts using new default split-service type fallback string parameters: ${fallbackUsed}`);
}

export async function down(db) {
    console.log("Reverting migration: 003-backfill-router-passwords (No-op to protect current system integrity)");
}
