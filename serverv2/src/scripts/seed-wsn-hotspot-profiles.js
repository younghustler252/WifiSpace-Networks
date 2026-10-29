import "../config/env.js";
import mongoose from "mongoose";
import { connectDatabase } from "../infrastructure/database/mongo.connecton.js";

// Proposed company defaults. Upload and download are in Mbps.
// RouterOS hotspot rate-limit uses upload/download order.
const TIERS = [
  [1, 1], [2, 2], [3, 3], [5, 5], [8, 5], [10, 5],
  [15, 8], [20, 10], [30, 15], [40, 20], [50, 25],
  [60, 30], [70, 35], [80, 40], [90, 45], [100, 50],
  [110, 55], [120, 60], [130, 65]
];

const apply = process.argv.includes("--apply");
const COLLECTION = "hotspot_standard_profiles";

async function main() {
  await connectDatabase();
  const collection = mongoose.connection.db.collection(COLLECTION);
  const desired = TIERS.map(([downloadMbps, uploadMbps]) => ({
    name: `WSN-${downloadMbps}M`,
    description: `WifiSpace standard ${downloadMbps} Mbps download tier`,
    serviceType: "hotspot",
    downloadMbps,
    uploadMbps,
    sharedUsers: 1,
    addMacCookie: true,
    macCookieTimeout: "3d",
    idleTimeout: "none",
    enabled: true,
    managedBy: "wifispace",
    schemaVersion: 1
  }));

  const existing = await collection.find({ name: { $in: desired.map((x) => x.name) } }).toArray();
  const byName = new Map(existing.map((x) => [x.name, x]));
  const rows = desired.map((profile) => ({
    name: profile.name,
    uploadMbps: profile.uploadMbps,
    downloadMbps: profile.downloadMbps,
    action: byName.has(profile.name) ? "KEEP EXISTING (never overwrite edits)" : "CREATE"
  }));
  console.table(rows);
  console.log(`\n${apply ? "APPLY" : "PREVIEW"}: ${rows.filter((r) => r.action === "CREATE").length} new profile(s).`);
  if (!apply) {
    console.log("No changes made. Run with --apply to create missing MongoDB records.");
    return;
  }

  // Do not overwrite administrator-edited profiles on subsequent runs.
  // A unique name index is created only after checking for duplicates.
  const duplicates = await collection.aggregate([
    { $group: { _id: "$name", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $limit: 1 }
  ]).toArray();
  if (duplicates.length) throw new Error("Duplicate profile names exist; resolve them before seeding.");
  await collection.createIndex({ name: 1 }, { unique: true });
  let created = 0;
  for (const profile of desired) {
    const result = await collection.updateOne(
      { name: profile.name },
      { $setOnInsert: { ...profile, createdAt: new Date(), updatedAt: new Date() } },
      { upsert: true }
    );
    if (result.upsertedCount) created++;
  }
  console.log(`Created ${created} profile(s); existing profiles were not modified.`);
  console.log("Router synchronization is NOT performed by this seed script.");
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await mongoose.disconnect().catch(() => {}); });
