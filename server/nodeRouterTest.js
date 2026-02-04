const { RouterOSAPI } = require("node-routeros");

const conn = new RouterOSAPI({
  host: "10.10.0.1",
  user: "render-api",
  password: "Access@pass123",
  port: 8728,
  ssl: false,
});

conn.connect()
  .then(() => {
    console.log("✅ CONNECTED TO MIKROTIK");
    return conn.close();
  })
  .catch(err => {
    console.error("❌ CONNECTION FAILED:", err);
  });
