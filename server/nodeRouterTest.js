require('dotenv').config();
const { RouterOSAPI } = require('node-routeros');

const HOST = process.env.ROUTEROS_HOST;
const USER = process.env.ROUTEROS_USER;
const PASS = process.env.ROUTEROS_PASS;
const PORT_SSL = Number(process.env.ROUTEROS_PORT_SSL) || 8729;
const PORT_PLAIN = Number(process.env.ROUTEROS_PORT_PLAIN) || 8728;

async function tryConnect(port, ssl) {
  const config = { host: HOST, user: USER, password: PASS, port, ssl, timeout: 5000 };
  try {
    console.log(`⏳ Trying ${ssl ? 'SSL' : 'plain'} connection on port ${port}...`);
    const conn = new RouterOSAPI(config);
    await conn.connect();

    console.log(`✅ Connected successfully on port ${port} (${ssl ? 'SSL' : 'plain'})`);
    const result = await conn.write('/system/identity/print');
    console.log('Router identity:', result[0]?.name || result);

    await conn.close();
    console.log('🛑 Connection closed\n');
    return true;
  } catch (err) {
    console.error(`❌ Connection failed on port ${port} (${ssl ? 'SSL' : 'plain'}):`, err.message || err);
    return false;
  }
}

(async () => {
  const sslResult = await tryConnect(PORT_SSL, true);
  const plainResult = await tryConnect(PORT_PLAIN, false);

  if (!sslResult && !plainResult) {
    console.error('⚠️ Both SSL and plain connections failed! Check firewall, credentials, or RouterOS API settings.');
  } else {
    console.log('✅ At least one connection worked. Use the correct port/SSL config in your app.');
  }

  process.exit(0);
})();
