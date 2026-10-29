import "../config/env.js";
import mongoose from "mongoose";
import { connectDatabase } from "../infrastructure/database/mongo.connecton.js";
import HotspotProfile from "../modules/network-config/database/hotspot-profile.model.js";

const SOURCE = "hotspot_standard_profiles";
const apply = process.argv.includes("--apply");
const deleteSource = process.argv.includes("--delete-source");

async function main() {
  if (deleteSource) throw new Error("Source deletion is intentionally unsupported. Verify frontend and router sync separately.");
  await connectDatabase();
  const source = mongoose.connection.db.collection(SOURCE);
  const records = await source.find({ name: /^WSN-\d+M$/ }).sort({ name: 1 }).toArray();
  if (!records.length) throw new Error(`No WSN profiles found in ${SOURCE}; nothing to migrate.`);

  const existing = await HotspotProfile.find({ name: { $regex: /^WSN-/i } }).lean();
  const existingByName = new Map(existing.map((p) => [p.name.toLowerCase(), p]));
  const rows = records.map((p) => {
    const target = existingByName.get(p.name.toLowerCase());
    const valid = Number.isInteger(p.uploadMbps) && p.uploadMbps >= 1 && Number.isInteger(p.downloadMbps) && p.downloadMbps >= 1;
    return {
      name: p.name, uploadMbps: p.uploadMbps, downloadMbps: p.downloadMbps,
      action: !valid ? "INVALID" : target ? (target.deletedAt ? "CONFLICT: soft-deleted" : "EXISTS: leave unchanged") : "CREATE"
    };
  });
  console.table(rows);
  const conflicts = rows.filter((r) => r.action === "INVALID" || r.action.startsWith("CONFLICT"));
  if (conflicts.length) throw new Error(`${conflicts.length} invalid/conflicting profile(s); no writes performed.`);
  const pending = rows.filter((r) => r.action === "CREATE");
  console.log(`${apply ? "APPLY" : "PREVIEW"}: ${pending.length} to create, ${rows.length - pending.length} existing. Source remains untouched.`);
  if (!apply) return;

  let created = 0;
  for (const row of pending) {
    const p = records.find((item) => item.name === row.name);
    // Use existing Mongoose model so records are visible through the existing API.
    // Do not invoke API use cases or dispatch router synchronization.
    try {
      await HotspotProfile.create({
        name: p.name, uploadMbps: p.uploadMbps, downloadMbps: p.downloadMbps,
        sharedUsers: p.sharedUsers ?? 1,
        macCookieTimeout: p.macCookieTimeout ?? "3d",
        idleTimeout: p.idleTimeout ?? "none",
        statusAutorefresh: p.statusAutorefresh ?? "1m",
        addMacCookie: p.addMacCookie ?? true,
        transparentProxy: p.transparentProxy ?? true,
        openStatusPage: p.openStatusPage ?? "always",
        advertise: p.advertise ?? false,
        description: p.description ?? null,
        deletedAt: null
      });
      created++;
    } catch (error) {
      if (error.code === 11000) {
        console.warn(`SKIPPED ${p.name}: duplicate detected during insert; review target manually.`);
        continue;
      }
      throw error;
    }
  }
  console.log(`Created ${created} managed profile(s). No router sync or source deletion performed.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await mongoose.disconnect().catch(() => {}); });
