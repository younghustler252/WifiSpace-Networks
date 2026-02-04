const fs = require("fs");
require("dotenv").config();
const csv = require("csv-parser");
const mongoose = require("mongoose");
const User = require("./models/User");
const mikrotikQueue = require("./queues/mikrotikQueue");
const { generateWsnId } = require("./utils/generateWsnId");

const CSV_FILE = "./Client DATABASE - users.csv";
const MONGO_URI = process.env.MONGO_URI;

// ---------------- Helpers ----------------
const generateEmail = (firstName, lastName, wsnId) => {
  const base = `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z]/g, "");
  return `${base || wsnId}@pending.local`;
};

const splitName = (fullName, wsnId) => {
  if (!fullName || !fullName.trim()) {
    return { firstName: "User", lastName: wsnId };
  }
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ") || "N/A",
  };
};

// ---------------- Main ----------------
const run = async () => {
  const rows = [];
  const failed = [];
  let success = 0;

  console.log("📥 Reading CSV...");

  // 1️⃣ Read CSV FIRST
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`📊 Rows loaded: ${rows.length}`);

  // 2️⃣ Process rows SEQUENTIALLY
  for (const row of rows) {
    try {
      const wsnId = row.wsnId || await generateWsnId();
      const macAddress = row.macAddress || null;

      const { firstName, lastName } = splitName(row.name, wsnId);
      const email = generateEmail(firstName, lastName, wsnId);
      const password = "ChangeMe123";

      const exists = await User.findOne({ wsnId });
      if (exists) {
        console.log("⏭ Skipping existing:", wsnId);
        continue;
      }

      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        role: "user",
        macAddress,
        wsnId,
      });

      await mikrotikQueue.add("createUser", {
        userId: user._id,
        username: user.wsnId,
        password,
        profile: "default",
      });

      success++;
      console.log("✅ Created:", wsnId);

    } catch (err) {
      console.error("❌ FAILED ROW:", row.wsnId, err.message);
      failed.push({ wsnId: row.wsnId, error: err.message });
    }
  }

  console.log("\n✅ Bulk upload finished");
  console.log("✔ Users created:", success);
  console.log("❌ Failed:", failed.length);

  if (failed.length) {
    fs.writeFileSync("failed_users.json", JSON.stringify(failed, null, 2));
  }
};

// ---------------- Bootstrap ----------------
const start = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Mongo connected");

  await run();

  await mongoose.disconnect();
  console.log("🔌 Mongo disconnected");
};

start();
