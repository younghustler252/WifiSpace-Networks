const asyncHandler = require("express-async-handler");
const User = require("../../models/User");
const Subscription = require("../../models/Subscription");
const Payment = require("../../models/Payment");
const mikrotikQueue = require("../../queues/mikrotikQueue");
const generateToken = require("../../utils/generateToken");
const generateWsnId = require("../../utils/generateWsnId");


// ---------------------------
// Validators
// ---------------------------
const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const validatePassword = (password) => password && password.length >= 6;

// ----------------------------------------------------
// 1️⃣ GET ALL USERS
// ----------------------------------------------------
const getAllUsers = asyncHandler(async (req, res) => {
    const { filter, sort, limit = 10, page = 1 } = req.query;

    const query = {};
    let sortOption = { wsnId: 1 };

    // -----------------------------
    // Parse & Apply Filters
    // -----------------------------
    if (filter) {
        let filters;

        try {
            filters = JSON.parse(filter);
        } catch (err) {
            return res.status(400).json({ message: "Invalid filter JSON" });
        }

        // 🔍 WSN ID (prefix search)
        if (filters.wsnId) {
            query.wsnId = { $regex: new RegExp(`^${filters.wsnId}`, "i") };
        }

        // 🔍 Email (partial match)
        if (filters.email) {
            query.email = { $regex: new RegExp(filters.email, "i") };
        }

        // 🔍 Name search
        if (filters.name) {
            query.$or = [
                { firstName: { $regex: filters.name, $options: "i" } },
                { lastName: { $regex: filters.name, $options: "i" } },
            ];
        }

        // 🔍 Role
        if (filters.role) {
            query.role = filters.role;
        }

        if (filters.subscriptionStatus) {
            query.subscriptionStatus = filters.subscriptionStatus;
        }

        // 🔍 Email verified
        if (filters.isVerified !== undefined) {
            query.isVerified = filters.isVerified;
        }

        // 🔍 MikroTik sync state
        if (filters.hotspotSynced !== undefined) {
            query.hotspotSynced = filters.hotspotSynced;
        }

        // 🔍 Date range
        if (filters.createdFrom || filters.createdTo) {
            query.createdAt = {};
            if (filters.createdFrom) {
                query.createdAt.$gte = new Date(filters.createdFrom);
            }
            if (filters.createdTo) {
                query.createdAt.$lte = new Date(filters.createdTo);
            }
        }
    }

    // -----------------------------
    // Sorting
    // -----------------------------
    if (sort) {
        sortOption = sort.split(",").reduce((acc, field) => {
            const direction = field.startsWith("-") ? -1 : 1;
            acc[field.replace(/^[-+]/, "")] = direction;
            return acc;
        }, {});
    }

    // -----------------------------
    // Pagination
    // -----------------------------
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    // -----------------------------
    // Query Execution
    // -----------------------------
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

    // -----------------------------
    // Response
    // -----------------------------
    res.status(200).json({
        users,
        meta: {
            totalCount,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalCount / limitNum),
        },
    });
});



/// ------------------------------------------------------------
// Admin Create User
// ------------------------------------------------------------
const createUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, macAddress, profile, role, address, wsnId: customWsnId } = req.body;

    // Required fields
    if (!firstName || !lastName || !email || !password || !role)
        return res.status(400).json({ message: "Missing required fields." });

    if (!validateEmail(email))
        return res.status(400).json({ message: "Invalid email format." });

    if (!validatePassword(password))
        return res.status(400).json({ message: "Password must be at least 6 characters." });

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
        return res.status(409).json({ message: "Email already registered." });

    // Ensure custom wsnId is unique
    if (customWsnId) {
        const existingWsnUser = await User.findOne({ wsnId: customWsnId });
        if (existingWsnUser)
            return res.status(409).json({ message: `WSN ID ${customWsnId} is already taken.` });
    }

    // Generate or use provided WSN ID
    const wsnId = customWsnId || await generateWsnId();

    // Create user in MongoDB
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

    // 🔹 Queue MikroTik job asynchronously (non-blocking)
    mikrotikQueue.add("createUser", {
        userId: newUser._id,
        username: newUser.wsnId,
        password,
        profile: profile || "default"
    }).catch(err => {
        console.error("⚠️ MikroTik job failed to enqueue:", err);
        // Optional: send alert or save in DB for retry
    });

    // Generate JWT token (optional)
    const token = generateToken(newUser);

    // Send response immediately
    res.status(201).json({
        message: "User created successfully. MikroTik initialization may be pending.",
        user: {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            wsnId: newUser.wsnId,
            macAddress: newUser.macAddress,
            role: newUser.role,
            address: newUser.address,
        },
        token,
    });
});



// ----------------------------------------------------
// 2️⃣ GET USER BY ID
// ----------------------------------------------------
const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id)
        .select("-password -verificationToken -googleId")
        .populate("subscription");

    if (!user) return res.status(404).json({ message: "User not found" });

    const recentPayments = await Payment.find({ userId: id })
        .sort("-createdAt")
        .limit(5);

    const usage = {
        totalBytesIn: user.totalBytesIn || 0,
        totalBytesOut: user.totalBytesOut || 0,
        devicesConnected: user.usageStats?.devicesConnected || 0,
        totalTimeOnline: user.usageStats?.totalTimeOnline || 0,
    };

    res.status(200).json({
        user,
        subscription: {
            plan: user.subscription,
            status: user.subscriptionStatus,
            start: user.subscriptionStart,
            end: user.subscriptionEnd,
            cancelAtPeriodEnd: user.cancelAtPeriodEnd,
        },
        usage,
        recentPayments,
    });
});

// ----------------------------------------------------
// 3️⃣ GET USER BY WSN ID
// ----------------------------------------------------
const getUserByWsn = asyncHandler(async (req, res) => {
    const { wsnId } = req.params;

    const user = await User.findOne({ wsnId })
        .select("-password -verificationToken -googleId")
        .populate("subscription");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
});

// ----------------------------------------------------
// 4️⃣ SEARCH USERS
// ----------------------------------------------------
const searchUsers = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Search query required" });

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

    res.status(200).json(users);
});

// ----------------------------------------------------
// 5️⃣ BAN / UNBAN USER (ACCESS ONLY)
// ----------------------------------------------------
const banUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { ban } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBanned = Boolean(ban);
    await user.save();

    if (ban) {
        await mikrotikQueue.add("disableUser", {
            userId: user._id,
            wsnId: user.wsnId,
        });
    }

    res.status(200).json({ message: `User ${ban ? "banned" : "unbanned"} successfully` });
});

// ----------------------------------------------------
// 6️⃣ FORCE EXPIRE SUBSCRIPTION
// ----------------------------------------------------
const forceExpireSubscription = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.subscriptionStatus = "expired";
    user.subscriptionEnd = new Date();
    await user.save();

    // Disable MikroTik access
    await mikrotikQueue.add("disableUser", {
        userId: user._id,
        wsnId: user.wsnId,
    });

    res.status(200).json({ message: "Subscription force-expired successfully" });
});



// ----------------------------------------------------
// 7️⃣ PROMOTE / DEMOTE USER ROLE
// ----------------------------------------------------
const updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["user", "customerService", "admin", "superadmin"];
    if (!validRoles.includes(role)) return res.status(400).json({ message: "Invalid role" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.status(200).json({ message: `User role updated to ${role}` });
});

// ----------------------------------------------------
// 8️⃣ ADMIN DASHBOARD STATS
// ----------------------------------------------------
// ----------------------------------------------------
// ADMIN DASHBOARD WITH PLAN ANALYTICS
// ----------------------------------------------------
const getAdminDashboard = asyncHandler(async (req, res) => {
    // --------------------------
    // 1️⃣ Basic stats
    // --------------------------
    const totalUsers = await User.countDocuments();
    const activeSubscriptions = await User.countDocuments({ subscriptionStatus: "active" });
    const inActiveSubscriptions = await User.countDocuments({ subscriptionStatus: { $ne: "active" } });
    const totalPayments = await Payment.countDocuments({ status: "successful" });

    const totalRevenueAgg = await Payment.aggregate([
        { $match: { status: "successful" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // --------------------------
    // 2️⃣ Subscription plan analytics: user count + revenue
    // --------------------------
    const subscriptionsAnalytics = await User.aggregate([
        { $match: { subscription: { $ne: null } } }, // users with subscription
        { $group: { _id: "$subscription", userCount: { $sum: 1 } } },
        {
            $lookup: {
                from: "subscriptions",       // collection name
                localField: "_id",
                foreignField: "_id",
                as: "plan"
            }
        },
        { $unwind: "$plan" },
        {
            $lookup: {
                from: "payments",
                let: { planId: "$plan._id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$planId", "$$planId"] }, status: "successful" } },
                    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
                ],
                as: "revenue"
            }
        },
        { $unwind: { path: "$revenue", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                planId: "$plan._id",
                planName: "$plan.planName",
                price: "$plan.price",
                userCount: 1,
                revenue: { $ifNull: ["$revenue.totalRevenue", 0] }
            }
        },
        { $sort: { userCount: -1 } } // optional: most popular plan first
    ]);

    // --------------------------
    // 3️⃣ Send response
    // --------------------------
    res.status(200).json({
        totalUsers,
        activeSubscriptions,
        totalPayments,
        totalRevenue,
        subscriptionsAnalytics
    });
});

// ----------------------------------------------------
// DELETE USER
// ----------------------------------------------------
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔹 Fire-and-forget MikroTik disable
    mikrotikQueue.add("disableUser", {
        userId: user._id,
        wsnId: user.wsnId,
    }).catch(err => console.error("⚠️ MikroTik job failed to enqueue:", err));

    // Delete related payments
    await Payment.deleteMany({ userId: id });

    // Delete subscription if exists
    if (user.subscription) {
        await Subscription.findByIdAndDelete(user.subscription);
    }

    // Delete user
    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully" });
});


const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, macAddress, address, profile, password } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate email if provided
    if (email && !validateEmail(email))
        return res.status(400).json({ message: "Invalid email format." });

    // Check if new email is already used
    if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) return res.status(409).json({ message: "Email already in use." });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (macAddress) user.macAddress = macAddress;
    if (address) user.address = address;

    // Update password if provided
    if (password) {
        if (!validatePassword(password)) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // 🔹 Fire-and-forget MikroTik profile update
    if (profile) {
        mikrotikQueue.add("updateUserProfile", {
            userId: user._id,
            wsnId: user.wsnId,
            profile
        }).catch(err => console.error("⚠️ MikroTik job failed to enqueue:", err));
    }

    res.status(200).json({
        message: "User updated successfully",
        user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            wsnId: user.wsnId,
            macAddress: user.macAddress,
            address: user.address,
            role: user.role,
        }
    });
});


// ----------------------------------------------------
// ASSIGN / ACTIVATE SUBSCRIPTION
// ----------------------------------------------------
const assignSubscription = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { subscriptionId, startDate, endDate } = req.body;

    if (!subscriptionId) {
        return res.status(400).json({ message: "subscriptionId is required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find subscription plan
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) return res.status(404).json({ message: "Subscription plan not found" });

    // Set dates
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + subscription.durationDays * 24 * 60 * 60 * 1000);

    // Update user subscription info
    user.subscription = subscription._id;
    user.subscriptionStatus = "active";
    user.subscriptionStart = start;
    user.subscriptionEnd = end;
    user.cancelAtPeriodEnd = false;

    await user.save();

    // 🔹 Fire-and-forget: activate user on MikroTik
    mikrotikQueue.add("enableUser", {
        userId: user._id,
        wsnId: user.wsnId,
        profile: subscription.profile || "default",
        startDate: start,
        endDate: end
    }).catch(err => console.error("⚠️ MikroTik job failed to enqueue:", err));

    res.status(200).json({
        message: "Subscription assigned and activated successfully",
        user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            wsnId: user.wsnId,
            subscription: subscription.planName,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionStart: user.subscriptionStart,
            subscriptionEnd: user.subscriptionEnd
        }
    });
});


module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    getUserByWsn,
    searchUsers,
    updateUser,
    deleteUser,
    banUser,
    forceExpireSubscription,
    updateUserRole,
    assignSubscription,
    getAdminDashboard,
};
