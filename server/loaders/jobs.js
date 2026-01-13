module.exports = () => {
	require('../services/mikrotikWorker');
	require('../utils/mikrotikSyncCron');
	require('../utils/subscriptionScheduler');
	require('../utils/expirePendingPayments');
};
