const User = require("../models/User");
const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");
const mikrotikQueue = require("../queues/mikrotikQueue");
const generateWsnId = require("../utils/generateWsnId");
const bcrypt = require("bcryptjs");
const validator = require("validator");

// -----------------------------
// Validators
// -----------------------------
const validateEmail = (email) => validator.isEmail(email);
const validatePassword = (password) => password && password.length >= 6;

// -----------------------------
// User Service
// -----------------------------
const UserService = {

	// ----------------------------------------------------
	// Get all users with filters, sorting & pagination
	// ----------------------------------------------------
	getAllUsers: async ({ filter, sort, limit = 10, page = 1 }) => {
		const query = {};
		let sortOption = { wsnId: 1 };

		// Apply filters
		if (filter) {
			let filters;
			try {
				filters = JSON.parse(filter);
			} catch (err) {
				throw { status: 400, message: "Invalid filter JSON" };
			}

			if (filters.wsnId) query.wsnId = { $regex: new RegExp(`^${filters.wsnId}`, "i") };
			if (filters.email) query.email = { $regex: new RegExp(filters.email, "i") };
			if (filters.name) {
				query.$or = [
					{ firstName: { $regex: filters.name, $options: "i" } },
					{ lastName: { $regex: filters.name, $options: "i" } },
				];
			}
			if (filters.role) query.role = filters.role;
			if (filters.subscriptionStatus) query.subscriptionStatus = filters.subscriptionStatus;
			if (filters.isVerified !== undefined) query.isVerified = filters.isVerified;
			if (filters.hotspotSynced !== undefined) query.hotspotSynced = filters.hotspotSynced;

			if (filters.createdFrom || filters.createdTo) {
				query.createdAt = {};
				if (filters.createdFrom) query.createdAt.$gte = new Date(filters.createdFrom);
				if (filters.createdTo) query.createdAt.$lte = new Date(filters.createdTo);
			}
		}

		// Apply sorting
		if (sort) {
			sortOption = sort.split(",").reduce((acc, field) => {
				const direction = field.startsWith("-") ? -1 : 1;
				acc[field.replace(/^[-+]/, "")] = direction;
				return acc;
			}, {});
		}

		// Pagination
		const pageNum = Math.max(Number(page), 1);
		const limitNum = Math.min(Math.max(Number(limit), 1), 100);
		const skip = (pageNum - 1) * limitNum;

		// Execute query
		const [users, totalCount] = await Promise.all([
			User.find(query)
				.select("-password -verificationToken -googleId")
				.populate("subscription")
				.sort(sortOption)
				.skip(skip)
				.limit(limitNum)
				.lean(),
			User.countDocuments(query),
		]);

		return {
			users,
			meta: {
				totalCount,
				page: pageNum,
				limit: limitNum,
				totalPages: Math.ceil(totalCount / limitNum),
			},
		};
	},

	// ----------------------------------------------------
	// Create a new user
	// ----------------------------------------------------
	createUser: async ({ firstName, lastName, email, password, macAddress, role, address, profile, wsnId: customWsnId }) => {

		if (!firstName || !lastName || !email || !password || !role) {
			throw { status: 400, message: "Missing required fields." };
		}

		if (!validateEmail(email)) throw { status: 400, message: "Invalid email format." };
		if (!validatePassword(password)) throw { status: 400, message: "Password must be at least 6 characters." };

		const existingUser = await User.findOne({ email });
		if (existingUser) throw { status: 409, message: "Email already registered." };

		if (customWsnId) {
			const existingWsnUser = await User.findOne({ wsnId: customWsnId });
			if (existingWsnUser) throw { status: 409, message: `WSN ID ${customWsnId} is already taken.` };
		}

		const wsnId = customWsnId || await generateWsnId();

		const newUser = await User.create({
			firstName,
			lastName,
			email,
			password,
			macAddress,
			role,
			address,
			wsnId,
		});

		// Queue MikroTik create
		mikrotikQueue.add("createUser", {
			userId: newUser._id,
			username: newUser.wsnId,
			password,
			profile: profile || "default"
		}).catch(err => console.error("⚠️ MikroTik job failed:", err));

		return newUser;
	},

	// ----------------------------------------------------
	// Get user by ID
	// ----------------------------------------------------
	getUserById: async (id) => {
		const user = await User.findById(id)
			.select("-password -verificationToken -googleId")
			.populate("subscription");

		if (!user) throw { status: 404, message: "User not found" };

		const recentPayments = await Payment.find({ userId: id }).sort("-createdAt").limit(5);

		const usage = {
			totalBytesIn: user.totalBytesIn || 0,
			totalBytesOut: user.totalBytesOut || 0,
			devicesConnected: user.usageStats?.devicesConnected || 0,
			totalTimeOnline: user.usageStats?.totalTimeOnline || 0,
		};

		return { user, usage, recentPayments };
	},

	// ----------------------------------------------------
	// Get user by WSN ID
	// ----------------------------------------------------
	getUserByWsnId: async (wsnId) => {
		const user = await User.findOne({ wsnId })
			.select("-password -verificationToken -googleId")
			.populate("subscription");

		if (!user) throw { status: 404, message: "User not found" };
		return user;
	},

	// ----------------------------------------------------
	// Search users
	// ----------------------------------------------------
	searchUsers: async (query) => {
		if (!query) throw { status: 400, message: "Search query required" };

		const regex = new RegExp(query, "i");
		const users = await User.find({
			$or: [
				{ firstName: regex },
				{ lastName: regex },
				{ email: regex },
				{ wsnId: regex },
			],
		})
			.select("-password -verificationToken -googleId")
			.populate("subscription");

		return users;
	},

	// ----------------------------------------------------
	// Update user
	// ----------------------------------------------------
	updateUser: async (id, { firstName, lastName, email, macAddress, address, profile, password }) => {
		const user = await User.findById(id);
		if (!user) throw { status: 404, message: "User not found" };

		if (email && email !== user.email) {
			if (!validateEmail(email)) throw { status: 400, message: "Invalid email format." };
			const emailExists = await User.findOne({ email });
			if (emailExists) throw { status: 409, message: "Email already in use." };
			user.email = email;
		}

		if (firstName) user.firstName = firstName;
		if (lastName) user.lastName = lastName;
		if (macAddress) user.macAddress = macAddress;
		if (address) user.address = address;

		if (password) {
			if (!validatePassword(password)) throw { status: 400, message: "Password must be at least 6 characters." };
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);
		}

		await user.save();

		if (profile) {
			mikrotikQueue.add("updateUserProfile", {
				userId: user._id,
				wsnId: user.wsnId,
				profile
			}).catch(err => console.error("⚠️ MikroTik job failed:", err));
		}

		return user;
	},

	// ----------------------------------------------------
	// Delete user
	// ----------------------------------------------------
	deleteUser: async (id) => {
		const user = await User.findById(id);
		if (!user) throw { status: 404, message: "User not found" };

		mikrotikQueue.add("disableUser", { userId: user._id, wsnId: user.wsnId })
			.catch(err => console.error("⚠️ MikroTik job failed:", err));

		await Payment.deleteMany({ userId: id });

		if (user.subscription) {
			await Subscription.findByIdAndDelete(user.subscription);
		}

		await user.deleteOne();
		return true;
	},

	// ----------------------------------------------------
	// Ban / Unban user
	// ----------------------------------------------------
	banUser: async (id, ban) => {
		const user = await User.findById(id);
		if (!user) throw { status: 404, message: "User not found" };

		user.isBanned = Boolean(ban);
		await user.save();

		if (ban) {
			mikrotikQueue.add("disableUser", { userId: user._id, wsnId: user.wsnId })
				.catch(err => console.error("⚠️ MikroTik job failed:", err));
		}

		return user.isBanned;
	},

	// ----------------------------------------------------
	// Force expire subscription
	// ----------------------------------------------------
	forceExpireSubscription: async (id) => {
		const user = await User.findById(id);
		if (!user) throw { status: 404, message: "User not found" };

		user.subscriptionStatus = "expired";
		user.subscriptionEnd = new Date();
		await user.save();

		mikrotikQueue.add("disableUser", { userId: user._id, wsnId: user.wsnId })
			.catch(err => console.error("⚠️ MikroTik job failed:", err));

		return user;
	},

	// ----------------------------------------------------
	// Update user role
	// ----------------------------------------------------
	updateUserRole: async (id, role) => {
		const validRoles = ["user", "customerService", "admin", "superadmin"];
		if (!validRoles.includes(role)) throw { status: 400, message: "Invalid role" };

		const user = await User.findById(id);
		if (!user) throw { status: 404, message: "User not found" };

		user.role = role;
		await user.save();
		return user.role;
	},

	// ----------------------------------------------------
	// Assign / activate subscription
	// ----------------------------------------------------
	assignSubscription: async (userId, subscriptionId, startDate, endDate) => {
		if (!subscriptionId) throw { status: 400, message: "subscriptionId is required" };

		const user = await User.findById(userId);
		if (!user) throw { status: 404, message: "User not found" };

		const subscription = await Subscription.findById(subscriptionId);
		if (!subscription) throw { status: 404, message: "Subscription plan not found" };

		const start = startDate ? new Date(startDate) : new Date();
		const end = endDate ? new Date(endDate) : new Date(start.getTime() + subscription.durationDays * 24 * 60 * 60 * 1000);

		user.subscription = subscription._id;
		user.subscriptionStatus = "active";
		user.subscriptionStart = start;
		user.subscriptionEnd = end;
		user.cancelAtPeriodEnd = false;

		await user.save();

		mikrotikQueue.add("enableUser", {
			userId: user._id,
			wsnId: user.wsnId,
			profile: subscription.profile || "default",
			startDate: start,
			endDate: end
		}).catch(err => console.error("⚠️ MikroTik job failed:", err));

		return user;
	},
};

module.exports = UserService;
