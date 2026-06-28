export async function up(db) {
    console.log("Running migration: 008-patch-legacy-roles");

    // 1. Update legacy 'admin' to 'superadmin'
    const adminResult = await db.collection("users").updateMany(
        { role: "admin" },
        { $set: { role: "superadmin" } }
    );
    console.log(`🔹 Legacy admin roles upgraded to superadmin: ${adminResult.modifiedCount}`);

    // 2. Update legacy 'user' to 'customer'
    const userResult = await db.collection("users").updateMany(
        { role: "user" },
        { $set: { role: "customer" } }
    );
    console.log(`🔹 Legacy user roles converted to customer: ${userResult.modifiedCount}`);

    // 3. Update legacy 'customerService' to 'staff'
    const csResult = await db.collection("users").updateMany(
        { role: "customerService" },
        { $set: { role: "staff" } }
    );
    console.log(`🔹 Legacy customerService roles mapped to staff: ${csResult.modifiedCount}`);

    console.log("🎉 User role normalization patch complete.");
}
