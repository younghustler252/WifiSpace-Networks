const { Queue } = require("bullmq");
const connection = require("../config/bullRedis");

const subscriptionExpiryQueue = new Queue("subscriptionExpiry", {
	connection
});

module.exports = subscriptionExpiryQueue;
