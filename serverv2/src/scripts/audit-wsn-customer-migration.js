/** Read-only WSN subscription/account/router migration audit. No writes. */
import "../config/env.js";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { connectDatabase } from "../infrastructure/database/mongo.connecton.js";
import { CredentialCipherService } from "../infrastructure/security/credential-cipher.service.js";
import { MikrotikClient } from "../infrastructure/networking/mikrotik/mikrotik.client.js";

const arg = (prefix) => process.argv.find((x) => x.startsWith(prefix))?.slice(prefix.length);
const mappingFile = path.resolve(arg("--mapping=") || "./wsn-plan-mapping.json");
const includeRouters = process.argv.includes("--routers");
const clean = (v) => String(v ?? "").trim();
const field = (row, name) => row[name] ?? row[`=${name}`] ?? "";
const numeric = (name) => Number(/^WSN-(\d+)M$/.exec(name)?.[1] ?? Infinity);

async function main() {
  const mapping = JSON.parse(fs.readFileSync(mappingFile, "utf8"));
  await connectDatabase();
  const db = mongoose.connection.db;
  const plans = await db.collection("plans").find({ _id: { $in: Object.keys(mapping).map((id) => new mongoose.Types.ObjectId(id)) } }).toArray();
  const planMap = new Map(plans.map((p) => [String(p._id), p]));
  const subs = await db.collection("subscriptions").find({ planId: { $in: plans.map((p) => p._id) } }, { projection: { planId: 1, accountId: 1, status: 1, planSnapshot: 1 } }).toArray();
  const accountIds = [...new Set(subs.map((s) => clean(s.accountId)).filter(Boolean))].map((id) => new mongoose.Types.ObjectId(id));
  const accounts = await db.collection("accounts").find({ _id: { $in: accountIds } }, { projection: { wsnId: 1, serviceType: 1, accessMethod: 1, routerId: 1, routerProfile: 1, status: 1, deletedAt: 1 } }).toArray();
  const accountMap = new Map(accounts.map((a) => [String(a._id), a]));
  const profiles = await db.collection("hotspotprofiles").find({ name: { $in: [...new Set(Object.values(mapping))] }, deletedAt: null }, { projection: { name: 1, uploadMbps: 1, downloadMbps: 1 } }).toArray();
  const profileMap = new Map(profiles.map((p) => [p.name, p]));
  const grouped = new Map();
  const exceptions = [];
  for (const [id, target] of Object.entries(mapping)) {
    const plan = planMap.get(id);
    if (!plan) { exceptions.push({ planId: id, reason: "MISSING PLAN" }); continue; }
    const key = plan.serviceType === "hotspot" ? "mikrotikProfile" : "ipoeProfile";
    if (plan[key] !== target) exceptions.push({ plan: plan.name, reason: `PLAN FIELD NOT MIGRATED: ${key}` });
    if (!profileMap.has(target)) exceptions.push({ plan: plan.name, reason: `MANAGED PROFILE MISSING: ${target}` });
    grouped.set(id, { plan: plan.name, service: plan.serviceType, target, total: 0, active: 0, expired: 0, other: 0, snapshotMismatch: 0, missingAccount: 0, accountProfileMismatch: 0 });
  }
  const detail = [];
  for (const sub of subs) {
    const id = clean(sub.planId);
    const row = grouped.get(id);
    if (!row) continue;
    row.total++;
    if (sub.status === "active") row.active++;
    else if (sub.status === "expired") row.expired++;
    else row.other++;
    const snapshotField = row.service === "hotspot" ? "mikrotikProfile" : "ipoeProfile";
    const snapshot = clean(sub.planSnapshot?.[snapshotField]);
    const mismatch = snapshot !== row.target;
    if (mismatch) row.snapshotMismatch++;
    const account = accountMap.get(clean(sub.accountId));
    if (!account) row.missingAccount++;
    const accountProfile = clean(account?.routerProfile);
    const accountMismatch = row.service === "pppoe" && account?.serviceType === "pppoe" && accountProfile !== row.target;
    if (accountMismatch) row.accountProfileMismatch++;
    if (sub.status === "active" || !account || (mismatch && sub.status !== "expired")) {
      detail.push({ subscriptionId: clean(sub._id), accountId: clean(sub.accountId), plan: row.plan, status: sub.status, service: row.service, accessMethod: account?.accessMethod ?? "UNKNOWN", snapshot: snapshot || "NOT SET", accountProfile: accountProfile || "NOT SET", target: row.target, snapshotMismatch: mismatch, accountMismatch: Boolean(accountMismatch), accountMissing: !account });
    }
  }
  console.log(`READ-ONLY WSN customer migration audit | database=${db.databaseName} | plans=${plans.length} | subscriptions=${subs.length} | accounts=${accounts.length}`);
  console.log("\nPlan / subscription summary:");
  console.table([...grouped.values()].sort((a, b) => numeric(a.target) - numeric(b.target)));
  console.log("\nActive / exceptional subscription details (IDs only; no credentials):");
  console.table(detail);
  if (exceptions.length) { console.log("\nWarnings:"); console.table(exceptions); }
  console.log("\nNOTE: Account routerProfile is an account DB field, NOT proof of the current MikroTik profile. Snapshot mismatches are not authorization to update expired history.");
  if (includeRouters) await routerAudit(db, new Set(Object.values(mapping)));
  console.log("\nAUDIT COMPLETE. No MongoDB or RouterOS changes made.");
}

async function routerAudit(db, targets) {
  const routers = await db.collection("routers").find({ isEnabled: true, apiEnabled: true }, { projection: { code: 1, host: 1, port: 1, username: 1, passwordEncrypted: 1, ssl: 1 } }).toArray();
  const cipher = new CredentialCipherService();
  const client = new MikrotikClient();
  const summary = [];
  const assignments = [];
  for (const r of routers) {
    try {
      const router = { host: r.host, port: r.port, username: r.username, password: cipher.decrypt(r.passwordEncrypted), ssl: r.ssl };
      const [profiles, users, active] = await Promise.all([
        client.execute(router, "/ip/hotspot/user/profile/print", [], 1),
        client.execute(router, "/ip/hotspot/user/print", [], 1),
        client.execute(router, "/ip/hotspot/active/print", [], 1)
      ]);
      const names = new Set(profiles.map((p) => clean(field(p, "name"))));
      const counts = new Map();
      const userProfiles = new Map();
      for (const u of users) {
        const profile = clean(field(u, "profile")) || "default";
        counts.set(profile, (counts.get(profile) || 0) + 1);
        userProfiles.set(clean(field(u, "name")), profile);
      }
      const sessions = new Map();
      for (const a of active) {
        const profile = userProfiles.get(clean(field(a, "user")));
        if (profile) sessions.set(profile, (sessions.get(profile) || 0) + 1);
      }
      const missing = [...targets].filter((name) => !names.has(name));
      summary.push({ router: r.code, reachable: true, wsnProfiles: targets.size - missing.length, missingWSN: missing.join(", ") || "none", users: users.length, active: active.length });
      for (const [profile, count] of counts) assignments.push({ router: r.code, profile, assignedUsers: count, activeSessions: sessions.get(profile) || 0, isWSN: targets.has(profile) });
    } catch (e) {
      summary.push({ router: r.code, reachable: false, error: e.message });
    }
  }
  console.log("\nLIVE ROUTER CHECK (Hotspot users only, read-only):");
  console.table(summary);
  console.table(assignments.sort((a, b) => a.router.localeCompare(b.router) || a.profile.localeCompare(b.profile, undefined, { numeric: true })));
  console.log("PPPoE/IPoE router assignments are NOT checked by this Hotspot-only router inventory.");
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(async () => { await mongoose.disconnect(); });
