/** Read-only plan/snapshot migration planner. Never writes to MongoDB or routers. */
import "../config/env.js";
import fs from "node:fs";
import mongoose from "mongoose";
import { connectDatabase } from "../infrastructure/database/mongo.connecton.js";
import Plan from "../modules/plan/database/plan.model.js";
import Subscription from "../modules/subscription/database/subscription.model.js";
import HotspotProfile from "../modules/network-config/database/hotspot-profile.model.js";

const mappingPath = process.argv.find((arg) => arg.startsWith("--mapping="))?.slice(10);
if (process.argv.includes("--apply")) {
  console.error("This planner is READ ONLY. --apply is not supported.");
  process.exit(1);
}

async function main() {
  await connectDatabase();
  const profiles = await HotspotProfile.find({ deletedAt: null, name: /^WSN-/ }).lean();
  const profileNames = new Set(profiles.map((p) => p.name));
  const plans = await Plan.find({ deletedAt: null, serviceType: { $in: ["pppoe", "hotspot"] } }).lean();
  const mapping = mappingPath ? JSON.parse(fs.readFileSync(mappingPath, "utf8")) : {};
  if (mapping === null || Array.isArray(mapping) || typeof mapping !== "object") throw new Error("Mapping must be a JSON object keyed by plan ID");
  const ids = new Set(plans.map((p) => String(p._id)));
  for (const [id, name] of Object.entries(mapping)) {
    if (!ids.has(id)) throw new Error(`Unknown or deleted plan ID: ${id}`);
    if (!profileNames.has(name)) throw new Error(`Destination profile is not managed/active: ${name}`);
  }
  const rows = [];
  for (const plan of plans) {
    const id = String(plan._id);
    const field = plan.serviceType === "hotspot" ? "mikrotikProfile" : "ipoeProfile";
    const current = plan[field] || "NOT SET";
    const target = mapping[id] || "UNMAPPED";
    const snapshotFilter = { planId: plan._id, status: { $in: ["active", "pending", "suspended"] } };
    const subscriptionCount = await Subscription.countDocuments(snapshotFilter);
    const snapshotDifferences = target === "UNMAPPED" ? null : await Subscription.countDocuments({
      ...snapshotFilter, [`planSnapshot.${field}`]: { $ne: target }
    });
    rows.push({ planId: id, plan: plan.name, service: plan.serviceType, field, current, target,
      subscriptions: subscriptionCount, snapshotsToReview: snapshotDifferences,
      action: target === "UNMAPPED" ? "SELECT DESTINATION" : current === target ? "ALREADY MAPPED" : "REVIEW CHANGE" });
  }
  console.log(`READ-ONLY WSN plan migration preview | Database: ${mongoose.connection.name}`);
  console.log(`Managed WSN profiles: ${profiles.length} | Plans: ${plans.length}`);
  console.table(rows);
  console.log("No database or router changes made. Snapshot counts are informational; no active subscription is modified.");
  console.log("Mapping JSON format: { \"<planId from table>\": \"WSN-10M\" }. Run with --mapping=/absolute/path/mapping.json");
}

main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await mongoose.disconnect(); });
