/** WSN plan-only migration. Does not modify subscriptions, accounts or routers. */
import "../config/env.js";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { connectDatabase } from "../infrastructure/database/mongo.connecton.js";
import Plan from "../modules/plan/database/plan.model.js";
import Subscription from "../modules/subscription/database/subscription.model.js";
import HotspotProfile from "../modules/network-config/database/hotspot-profile.model.js";

const getArg = (prefix) => process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
const apply = process.argv.includes("--apply");
const rollbackPath = getArg("--rollback=");
const mappingPath = getArg("--mapping=") || "./wsn-plan-mapping.json";
const backupPath = getArg("--backup=");
if (apply && rollbackPath) throw new Error("Choose --apply or --rollback, not both");

const json = (file) => JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
const key = (plan) => plan.serviceType === "hotspot" ? "mikrotikProfile" : "ipoeProfile";
const matchValue = (value) => value == null ? null : value;

async function main() {
  await connectDatabase();
  const db = mongoose.connection.name;
  if (rollbackPath) {
    if (apply && !backupPath) throw new Error("Rollback apply requires --backup=NEW_FILE.json to save a pre-rollback snapshot");
    const backup = json(rollbackPath);
    if (backup.database !== db || !Array.isArray(backup.rows) || !backup.rows.length) throw new Error("Backup database mismatch or invalid rows");
    const rows = [];
    for (const item of backup.rows) {
      const plan = await Plan.findById(item.id).lean();
      if (!plan || key(plan) !== item.field) throw new Error(`Missing or changed plan ${item.id}`);
      if (matchValue(plan[item.field]) !== matchValue(item.to)) throw new Error(`Rollback conflict for ${plan.name}: current value changed`);
      rows.push({ plan, field: item.field, from: item.to, to: item.from });
    }
    console.table(rows.map(({plan,field,from,to}) => ({ plan:plan.name, field, current:from, restore:to })));
    if (!apply) { console.log("ROLLBACK PREVIEW ONLY. Add --apply --backup=NEW_FILE.json to restore."); return; }
    writeBackup(backupPath, db, rows);
    await writeRows(rows);
    console.log(`Rollback complete for ${rows.length} plans. Subscriptions and routers untouched.`);
    return;
  }
  const mapping = json(mappingPath);
  if (!mapping || Array.isArray(mapping) || typeof mapping !== "object") throw new Error("Mapping must be an object");
  const plans = await Plan.find({ deletedAt: null, serviceType: { $in: ["pppoe", "hotspot"] } }).lean();
  const profiles = await HotspotProfile.find({ deletedAt: null, name: /^WSN-/ }).lean();
  const names = new Set(profiles.map((p) => p.name));
  const ids = new Set(plans.map((p) => String(p._id)));
  if (Object.keys(mapping).length !== plans.length) throw new Error(`Expected mappings for all ${plans.length} plans, got ${Object.keys(mapping).length}`);
  for (const [id, target] of Object.entries(mapping)) {
    if (!ids.has(id)) throw new Error(`Unknown plan: ${id}`);
    if (!names.has(target)) throw new Error(`Missing managed WSN profile: ${target}`);
  }
  const rows = plans.map((plan) => ({ plan, field:key(plan), from:matchValue(plan[key(plan)]), to:mapping[String(plan._id)] }));
  const changes = rows.filter((row) => row.from !== row.to);
  const statuses = await Subscription.aggregate([
    { $match: { planId: { $in: plans.map((p) => p._id) } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  console.log(`WSN PLAN-ONLY migration | database=${db} | changes=${changes.length}/${plans.length}`);
  console.table(rows.map(({plan,field,from,to}) => ({plan:plan.name, service:plan.serviceType, field, current:from || "NOT SET", target:to, action:from === to ? "SKIP" : "CHANGE"})));
  console.log("Subscription status counts (informational; NO subscription snapshots updated):");
  console.table(statuses);
  if (!apply) { console.log("PREVIEW ONLY. To update plan definitions: --apply --backup=./wsn-plan-backup.json"); return; }
  if (!backupPath) throw new Error("--apply requires --backup=FILE.json (must not exist)");
  if (!changes.length) { console.log("Already mapped. No writes performed."); return; }
  writeBackup(backupPath, db, changes);
  await writeRows(changes);
  console.log(`Updated ${changes.length} plan definitions. Backup: ${path.resolve(backupPath)}. No subscription/account/router changes.`);
}

function writeBackup(file, db, rows) {
  const absolute = path.resolve(file);
  const data = { version:1, database:db, createdAt:new Date().toISOString(), rows:rows.map(({plan,field,from,to}) => ({id:String(plan._id), name:plan.name, field, from, to})) };
  fs.writeFileSync(absolute, JSON.stringify(data,null,2) + "\n", { flag:"wx", mode:0o600 });
  console.log(`Recovery snapshot saved: ${absolute}`);
}

async function writeRows(rows) {
  let done = 0;
  for (const {plan,field,from,to} of rows) {
    const condition = { _id:plan._id, deletedAt:null, [field]:from };
    const result = await Plan.updateOne(condition, { $set:{[field]:to} });
    if (result.matchedCount !== 1) throw new Error(`Conflict updating ${plan.name}. ${done} earlier updates may have succeeded; inspect backup and rerun/restore manually.`);
    done++;
  }
}

main().catch((error) => { console.error(error); process.exitCode=1; }).finally(async () => { await mongoose.disconnect(); });
