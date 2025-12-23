require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Default route
app.get('/', (req, res) => res.send('✅ Server is running'));

// Bind to port **immediately**
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));

// Now do async startup tasks
(async () => {
  try {
    const connectDB = require('./config/db');
    const { connectRouter } = require('./config/routeros');

    await connectDB();
    console.log('✅ MongoDB connected');

    try {
      await connectRouter();
      console.log('✅ RouterOS connected');
    } catch (err) {
      console.warn('⚠ RouterOS connection failed:', err.message);
    }

    // Start workers/cron jobs
    require('./services/mikrotikWorker');
    require('./utils/mikrotikSyncCron');
    require('./utils/subscriptionScheduler');
    require('./utils/expirePendingPayments');

  } catch (err) {
    console.error('❌ Startup error:', err);
  }
})();
