export async function up(db) {
    console.log("Running migration: 002-router-agent-fields");

    const result = await db.collection("routers").updateMany(
        {
            connectionType: { $exists: false }
        },
        {
            $set: {
                connectionType: "direct",
                connectorId: null,
                agentStatus: "offline",
                agentLastSeenAt: null,
                siteCode: null,
                updatedAt: new Date(),
            }
        }
    );

    console.log(`Routers updated: ${result.modifiedCount}`);
}