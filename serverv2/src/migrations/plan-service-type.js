export async function up(db) {
    console.log("Running migration: 002-assign-default-router");

    const defaultRouterId = "6a095ac9135798557f85cecb";

    const result = await db.collection("accounts").updateMany(
        { $or: [{ routerId: { $exists: false } }, { routerId: null }] },
        {
            $set: {
                routerId: defaultRouterId,
                mikrotikUserCreated: false, // optional, ensures consistency
            },
        }
    );

    console.log(`Migration complete. Updated ${result.modifiedCount} accounts.`);
}