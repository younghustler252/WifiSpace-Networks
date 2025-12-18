const Redis = require('ioredis');

const connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

connection.on('connect', () => {
    console.log('✅ Redis (BullMQ) connected');
});

connection.on('error', (err) => {
    console.error('❌ BullMQ Redis error:', err);
});

module.exports = connection;
