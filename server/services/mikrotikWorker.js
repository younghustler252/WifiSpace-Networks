const { Worker } = require('bullmq');
const connection = require('../config/bullRedis'); // ✅ reuse BullMQ Redis
const User = require('../models/User');
const {
	addHotspotUser,
	updateHotspotPassword,
	updateHotspotProfile,
	enableHotspotUser,
	disableHotspotUser,
	checkHotspotUser,
	getAllHotspotUsers,
} = require('../utils/routerosHelpers');

// --------------------------------------------------
// Worker
// --------------------------------------------------
const worker = new Worker(
	'mikrotikQueue',
	async (job) => {
		const data = job.data;

		switch (job.name) {
			case 'createUser':
				await addHotspotUser(data.wsnId, data.password, data.profile);
				await User.findByIdAndUpdate(data.userId, {
					hotspotSynced: true,
					hotspotError: null,
					lastSyncAt: new Date(),
					routerPassword: data.password,
					routerProfile: data.profile,
					routerComment: 'Created by App',
				});
				return { success: true };

			case 'updatePassword':
				await updateHotspotPassword(data.wsnId, data.newPassword);
				await User.findByIdAndUpdate(data.userId, {
					hotspotSynced: true,
					hotspotError: null,
					routerPassword: data.newPassword,
					lastSyncAt: new Date(),
				});
				return { success: true };

			case 'updateProfile':
				await updateHotspotProfile(data.wsnId, data.profile);
				await User.findByIdAndUpdate(data.userId, {
					hotspotSynced: true,
					hotspotError: null,
					routerProfile: data.profile,
					lastSyncAt: new Date(),
				});
				return { success: true };

			case 'disableUser':
				await disableHotspotUser(data.wsnId);
				await User.findByIdAndUpdate(data.userId, {
					hotspotSynced: true,
					hotspotError: null,
					lastSyncAt: new Date(),
				});
				return { success: true };

			case 'enableUser':
				await enableHotspotUser(data.wsnId);
				await User.findByIdAndUpdate(data.userId, {
					hotspotSynced: true,
					hotspotError: null,
					lastSyncAt: new Date(),
				});
				return { success: true };

			case 'ensureUserExists': {
				const exists = await checkHotspotUser(data.wsnId);

				if (!exists) {
					await addHotspotUser(data.wsnId, data.password, data.profile);
					await User.findByIdAndUpdate(data.userId, {
						hotspotSynced: true,
						hotspotError: null,
						lastSyncAt: new Date(),
						routerPassword: data.password,
						routerProfile: data.profile,
						routerComment: 'Auto-created on login',
					});
				}

				return { success: true, created: !exists };
			}

			case 'importRouterUsers': {
				const users = await getAllHotspotUsers();

				for (const u of users) {
					const existing = await User.findOne({ wsnId: u.name });

					if (!existing) {
						await User.create({
							firstName: 'Imported',
							lastName: 'User',
							email: `${u.name}-${Date.now()}@import.local`,
							password: null,
							wsnId: u.name,
							routerPassword: null,
							routerProfile: u.profile || 'default',
							hotspotSynced: true,
							imported: true,
						});
					}
				}

				return { success: true, count: users.length };
			}
		}
	},
	{ connection }
);

// --------------------------------------------------
// Logs
// --------------------------------------------------
worker.on('completed', (job) => {
	console.log(`✅ Job Completed: ${job.name} | ID: ${job.id}`);
});

worker.on('failed', async (job, err) => {
	console.error(`❌ Job Failed: ${job.name} | ID: ${job.id}`, err.message);

	if (job?.data?.userId) {
		await User.findByIdAndUpdate(job.data.userId, {
			hotspotSynced: false,
			hotspotError: err.message,
			lastSyncAt: new Date(),
		});
	}
});

// --------------------------------------------------
// Graceful Shutdown
// --------------------------------------------------
process.on('SIGTERM', async () => {
	console.log('🛑 Shutting down worker...');
	await worker.close();
	await connection.quit();
	process.exit(0);
});

module.exports = worker;
