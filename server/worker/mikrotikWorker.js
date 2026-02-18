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
	getHotspotUsers,
	updateHotspotUser, // This helper should update dynamic fields from MikroTik to DB
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
				// Create user in MikroTik
				await addHotspotUser(data.wsnId, data.password, data.profile, data.userId);
				// Sync user details to MongoDB
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
				// Update MikroTik password
				await updateHotspotPassword(data.wsnId, data.newPassword);
				// Sync password update to MongoDB
				await User.findByIdAndUpdate(data.userId, {
					hotspotSynced: true,
					hotspotError: null,
					routerPassword: data.newPassword,
					lastSyncAt: new Date(),
				});
				return { success: true };

			case 'updateProfile':
				// Update MikroTik profile
				await updateHotspotProfile(data.wsnId, data.profile);
				// Sync profile update to MongoDB
				await User.findByIdAndUpdate(data.userId, {
					hotspotSynced: true,
					hotspotError: null,
					routerProfile: data.profile,
					lastSyncAt: new Date(),
				});
				return { success: true };

			case 'disableUser':
				// Disable user in MikroTik
				await disableHotspotUser(data.wsnId);
				// Sync status to MongoDB
				await User.findByIdAndUpdate(data.userId, {
					hotspotSynced: true,
					hotspotError: null,
					lastSyncAt: new Date(),
				});
				return { success: true };

			case 'enableUser':
				// Enable user in MikroTik
				await enableHotspotUser(data.wsnId);
				// Sync status to MongoDB
				await User.findByIdAndUpdate(data.userId, {
					hotspotSynced: true,
					hotspotError: null,
					lastSyncAt: new Date(),
				});
				return { success: true };

			case 'ensureUserExists': {
				const exists = await checkHotspotUser(data.wsnId);

				if (!exists) {
					await addHotspotUser(data.wsnId, data.password, data.profile, data.userId);
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

			// case 'importRouterUsers': {
			// 	const users = await getAllHotspotUsers();

			// 	for (const u of users) {
			// 		const existing = await User.findOne({ wsnId: u.name });

			// 		if (!existing) {
			// 			await User.create({
			// 				firstName: 'Imported',
			// 				lastName: 'User',
			// 				email: `${u.name}-${Date.now()}@import.local`,
			// 				password: null,
			// 				wsnId: u.name,
			// 				routerPassword: null,
			// 				routerProfile: u.profile || 'default',
			// 				hotspotSynced: true,
			// 				imported: true,
			// 			});
			// 		}
			// 	}

			// 	return { success: true, count: users.length };
			// }

			case 'fullSync': {
				// Full sync: update all users from MikroTik and ensure DB reflects it
				const routerUsers = await getHotspotUsers(); // MikroTik → DB
				for (const ru of routerUsers) {
					const dbUser = await User.findOne({ wsnId: ru.username });

					if (!dbUser) continue;

					// ---- Sync dynamic fields from MikroTik → DB ----
					dbUser.totalBytesIn = ru.bytesIn;
					dbUser.totalBytesOut = ru.bytesOut;
					dbUser.lastSeenAt = new Date(); // optional, last online
					dbUser.activeSessions.push({
						sessionId: ru.id,
						ip: ru.address,
						mac: ru.mac,
						uptime: ru.uptime,
						bytesIn: ru.bytesIn,
						bytesOut: ru.bytesOut,
						loginBy: ru.loginBy,
						startedAt: new Date()
					});

					// ---- Sync static fields from DB → MikroTik ----
					if (dbUser.routerPassword && dbUser.routerPassword !== ru.password) {
						await updateHotspotPassword(ru.username, dbUser.routerPassword);
					}

					if (dbUser.routerProfile && dbUser.routerProfile !== ru.profile) {
						await updateHotspotProfile(ru.username, dbUser.routerProfile);
					}

					if (dbUser.hotspotSynced && ru.disabled) {
						await enableHotspotUser(ru.username);
					} else if (!dbUser.hotspotSynced && !ru.disabled) {
						await disableHotspotUser(ru.username);
					}

					// Save changes to DB
					await dbUser.save();
				}

				return { success: true };
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
