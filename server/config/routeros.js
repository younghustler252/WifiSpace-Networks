const { RouterOSAPI } = require("node-routeros");
const PQueue = require("p-queue").default;

const config = {
  host: process.env.ROUTEROS_HOST,
  user: process.env.ROUTEROS_USER,
  password: process.env.ROUTEROS_PASS,
  port: process.env.ROUTEROS_PORT || 8728,
  timeout: 10000,
};

let conn = null;
let connected = false;
let connecting = false;
const queue = new PQueue({ concurrency: 1 });

let retryDelay = 2000;

async function connectRouter() {
  while (!connected) {
    if (connecting) {
      await new Promise(r => setTimeout(r, 500));
      continue;
    }

    connecting = true;
    try {
      console.log('⏳ Connecting to MikroTik...')
      conn = new RouterOSAPI(config);
      await conn.connect();
      connected = true;
      connecting = false;
      retryDelay = 2000;
      console.log('✅ Connected to MikroTik');
      conn.on("error", handleRouterError);
    } catch (err) {
      console.log(`❌ RouterOS connection failed: ${err.message}, retrying in ${retryDelay / 1000}s`);
      connected = false;
      connecting = false;
      await new Promise(r => setTimeout(r, retryDelay));
      retryDelay = Math.min(retryDelay * 2, 30000);
    }
  }
}

function handleRouterError(err) {
  console.log("⚠️ RouterOS connection error:", err.message);
  connected = false;
}

function waitForConnection() {
  return new Promise(resolve => {
    if (connected) return resolve();
    const check = setInterval(() => {
      if (connected) {
        clearInterval(check);
        resolve();
      }
    }, 500);
  });
}

async function runCommand(cmd) {
  return queue.add(async () => {
    await waitForConnection();
    try {
      const result = await conn.write(cmd);
      return result;
    } catch (err) {
      console.log("❌ RouterOS command failed:", err.message);
      connected = false;
      throw err;
    }
  });
}

process.on("SIGINT", async () => {
  console.log("🛑 Closing RouterOS connection...");
  if (conn) await conn.close();
  process.exit(0);
});

module.exports = { connectRouter, runCommand };
