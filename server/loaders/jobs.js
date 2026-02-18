module.exports = () => {
	require('../worker/mikrotikWorker');
	require('../utils/mikrotikSyncCron');
	require('../jobs/subscriptionScheduler');
	require('../jobs/subscriptionExpiry');
	require('../utils/expirePendingPayments');

};
