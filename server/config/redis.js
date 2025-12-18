const redis = require('redis');

// Create a Redis client with connection settings
const connection = redis.createClient({
  url: process.env.REDIS_URL,
});

// Handle Redis connection events
connection.on('connect', () => {
  console.log('Redis connected successfully!');
});

connection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = connection;
