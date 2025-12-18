const { Queue } = require('bullmq');
const connection = require('../config/bullRedis');

const mikrotikQueue = new Queue('mikrotikQueue', {
	connection,
	defaultJobOptions: {
		attempts: 5,
		backoff: {
			type: 'exponential',
			delay: 5000,
		},
		removeOnComplete: true,
		removeOnFail: false,
	},
});

module.exports = mikrotikQueue;
