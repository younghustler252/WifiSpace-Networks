import "../config/env.js";
import mongoose from "mongoose";
import { connectDatabase } from "../infrastructure/database/mongo.connecton.js";
import RouterModel from "../modules/router/database/router.model.js";
import { CredentialCipherService } from "../infrastructure/security/credential-cipher.service.js";
import { MikrotikClient } from "../infrastructure/networking/mikrotik/mikrotik.client.js";

// READ-ONLY audit: no RouterOS add/set/remove commands or MongoDB writes.
// Run: NODE_ENV=production node src/scripts/audit-hotspot-profiles.js
const cipher = new CredentialCipherService();
const client = new MikrotikClient();
const clean = (value) => String(value ?? "").trim();
const field = (obj, name) => obj[name] ?? obj[`=${name}`] ?? "";
const key = (router, name) => `${router}::${name}`;

function parseRateLimit(value) {
  const raw = clean(value);
  if (!raw) return { uploadMbps: null, downloadMbps: null, note: "No rate limit" };
  const [upload, download] = raw.split("/");
  const parse = (part) => {
    const match = /^([0-9]+(?:\.[0-9]+)?)([kKmMgG]?)$/.exec(clean(part));
    if (!match) return null;
    const factor = { "": 1 / 1_000_000, k: 1 / 1000, m: 1, g: 1000 }[match[2].toLowerCase()];
    return Number(match[1]) * factor;
  };
  const up = parse(upload);
  const down = parse(download);
  return { uploadMbps: up, downloadMbps: down, note: up === null || down === null ? "Complex/unsupported rate-limit: review manually" : "" };
}

async function main() {
  await connectDatabase();
  const db = mongoose.connection.db;
  console.log(`\nREAD-ONLY Hotspot profile audit | Database: ${db.databaseName}`);
  const routers = await RouterModel.find({ isEnabled: true, apiEnabled: true })
    .select("+passwordEncrypted name code host port username passwordEncrypted supportedServices")
    .lean();
  const plans = await db.collection("plans").find({ deletedAt: null }, { projection: { name: 1, serviceType: 1, speedRate: 1, ipoeProfile: 1, mikrotikProfile: 1 } }).toArray();
  const subscriptions = await db.collection("subscriptions").aggregate([
    { $match: { status: { $in: ["active", "pending", "suspended"] } } },
    { $group: { _id: "$planSnapshot.ipoeProfile", count: { $sum: 1 } } }
  ]).toArray();
  const snapshotCounts = new Map(subscriptions.map((s) => [clean(s._id), s.count]));
  const records = [];
  const routerSummary = [];

  for (const doc of routers) {
    const code = doc.code || doc.name || String(doc._id);
    try {
      if (!doc.passwordEncrypted) throw new Error("Missing encrypted router credential");
      const router = { host: doc.host, port: doc.port, username: doc.username, password: cipher.decrypt(doc.passwordEncrypted) };
      const [profiles, users, active] = await Promise.all([
        client.execute(router, "/ip/hotspot/user/profile/print", [], 1),
        client.execute(router, "/ip/hotspot/user/print", [], 1),
        client.execute(router, "/ip/hotspot/active/print", [], 1)
      ]);
      const assigned = new Map();
      const userProfile = new Map();
      for (const user of users) {
        const profile = clean(field(user, "profile")) || "default";
        assigned.set(profile, (assigned.get(profile) || 0) + 1);
        userProfile.set(clean(field(user, "name")), profile);
      }
      const activeCounts = new Map();
      for (const session of active) {
        const profile = userProfile.get(clean(field(session, "user")));
        if (profile) activeCounts.set(profile, (activeCounts.get(profile) || 0) + 1);
      }
      for (const p of profiles) {
        const name = clean(field(p, "name"));
        if (!name) continue;
        const rateLimit = clean(field(p, "rate-limit"));
        const rate = parseRateLimit(rateLimit);
        const referencedPlans = plans.filter((plan) => clean(plan.ipoeProfile) === name || (plan.serviceType === "hotspot" && clean(plan.mikrotikProfile) === name));
        records.push({ router: code, name, rateLimit, ...rate,
          sharedUsers: clean(field(p, "shared-users")),
          assignedUsers: assigned.get(name) || 0,
          activeSessions: activeCounts.get(name) || 0,
          portalPlans: referencedPlans.map((p) => p.name),
          subscriptionSnapshots: snapshotCounts.get(name) || 0
        });
      }
      routerSummary.push({ router: code, reachable: true, profiles: profiles.length, users: users.length, activeSessions: active.length });
    } catch (error) {
      routerSummary.push({ router: code, reachable: false, error: error.message });
    }
  }
  const reachable = routerSummary.filter((r) => r.reachable).map((r) => r.router);
  const byName = new Map();
  for (const r of records) {
    if (!byName.has(r.name)) byName.set(r.name, []);
    byName.get(r.name).push(r);
  }
  console.log("\nRouter connection summary:");
  console.table(routerSummary);
  console.log("\nProfile inventory (counts only; no customer identities):");
  console.table(records.map(({ router, name, rateLimit, uploadMbps, downloadMbps, assignedUsers, activeSessions, portalPlans, subscriptionSnapshots, note }) => ({
    router, name, rateLimit, uploadMbps, downloadMbps, assignedUsers, activeSessions,
    portalPlans: portalPlans.join(", "), subscriptionSnapshots, note
  })));
  console.log("\nCross-router comparison (REVIEW does not mean safe to delete):");
  console.table([...byName].sort(([a], [b]) => a.localeCompare(b)).map(([name, rows]) => {
    const signatures = new Set(rows.map((r) => `${r.rateLimit}|${r.sharedUsers}`));
    const used = rows.some((r) => r.assignedUsers || r.activeSessions || r.portalPlans.length || r.subscriptionSnapshots);
    return { name, presentOn: rows.map((r) => r.router).join(", "), missingOn: reachable.filter((r) => !rows.some((row) => row.router === r)).join(", "), configMismatch: signatures.size > 1,
      assignedUsers: rows.reduce((sum, r) => sum + r.assignedUsers, 0),
      activeSessions: rows.reduce((sum, r) => sum + r.activeSessions, 0),
      portalReferenced: rows.some((r) => r.portalPlans.length > 0 || r.subscriptionSnapshots > 0),
      recommendation: used ? "KEEP / REVIEW" : "REVIEW UNUSED (do not delete yet)" };
  }));
  console.log("\nPortal IPoE plans and router coverage:");
  console.table(plans.filter((p) => p.serviceType === "pppoe").map((p) => {
    const expected = clean(p.ipoeProfile) || (Number.isFinite(Number.parseInt(p.speedRate, 10)) ? `${Number.parseInt(p.speedRate, 10)}Mbps-userprofile` : "");
    const rows = byName.get(expected) || [];
    return { plan: p.name, speedRate: p.speedRate, ipoeProfile: clean(p.ipoeProfile) || "NOT SET", expected,
      missingOn: reachable.filter((router) => !rows.some((r) => r.router === router)).join(", ") };
  }));
  if (routerSummary.some((r) => !r.reachable)) console.warn("\nWARNING: Some routers failed. Missing/unused conclusions are incomplete.");
  console.log("\nAUDIT COMPLETE: no changes made to routers or MongoDB. Do not delete based on counts alone; check scheduler/provisioning references and inactive assignments first.");
}

main().catch((error) => { console.error("Audit failed:", error.message); process.exitCode = 1; })
  .finally(async () => { await client.disconnectAll().catch(() => {}); await mongoose.disconnect().catch(() => {}); });
