export async function up(db) {
    console.log("Running migration: 003-backfill-router-passwords");

    // 1. Fetch all accounts currently missing a router password, or where it's null/empty
    const accounts = await db.collection("accounts").find({
        $or: [
            { routerPassword: null },
            { routerPassword: "" },
            { routerPassword: { $exists: false } }
        ]
    }).toArray();

    console.log(`Found ${accounts.length} profiles requiring router password updates.`);

    let updated = 0;
    let fallbackUsed = 0;

    for (const account of accounts) {
        // 2. Locate the owner user document to find their phone number
        const user = await db.collection("users").findOne({ _id: account.userId });

        let targetPassword = "access@C0NN3CT@pppoe123$"; // Secure structural default

        if (user && user.phoneNumber && user.phoneNumber.trim() !== "") {
            targetPassword = user.phoneNumber.trim();
        } else {
            fallbackUsed++;
        }

        // 3. Update the specific account record inline
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

    console.log(`Successfully completed password backfill.`);
    console.log(`Total accounts updated: ${updated}`);
    console.log(`Accounts using default fallback password: ${fallbackUsed}`);
}

export async function down(db) {
    console.log("Reverting migration: 003-backfill-router-passwords (No-op to protect current system integrity)");
}
