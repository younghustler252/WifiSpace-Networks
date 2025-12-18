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
    const { filter, sort, limit = 10, page = 1 } = req.query;  // Parse query parameters
    const query = {};
    let sortOption = { "wsnId": 1 };  // Default sorting by `wsnId`

    // Apply filters if present in query
    if (filter) {
        const filters = JSON.parse(filter); // For example: { wsnId: '001', activeSubscription: true }
        if (filters.wsnId) {
            query.wsnId = { $regex: new RegExp(`^${filters.wsnId}`, "i") };  // Filter by wsnId
        }
        if (filters.activeSubscription !== undefined) {
            query['subscription.isActive'] = filters.activeSubscription;  // Filter by subscription status
        }
        // Add more filters as needed (e.g., user role, active status)
    }

    // Apply sorting if specified in query
    if (sort) {
        const sortFields = sort.split(",");  // For example: 'wsnId,-createdAt'
        sortOption = sortFields.reduce((acc, field) => {
            const direction = field.startsWith('-') ? -1 : 1;
            acc[field.replace(/^[-+]/, '')] = direction;
            return acc;
        }, {});
    }

    try {
        const users = await User.find(query)  // Apply filters
            .select("-password -verificationToken -googleId")
            .populate("subscription")  // Make sure to populate the subscription details
            .sort(sortOption)  // Apply sorting
            .skip((page - 1) * limit)  // Pagination: skip items for the current page
            .limit(Number(limit));  // Pagination: limit the number of users returned

        const totalCount = await User.countDocuments(query);  // Get total count for pagination

        res.status(200).json({
            users,
            totalCount,
            page,
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
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

    if (!password)
        return res.status(400).json({ message: "Password is required." });

    if (!validatePassword(password))
        return res.status(400).json({ message: "Password must be at least 6 characters." });

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
        return res.status(409).json({ message: "Email already registered." });

    // If the admin provides a custom wsnId, ensure it's unique
    if (customWsnId) {
        const existingWsnUser = await User.findOne({ wsnId: customWsnId });
        if (existingWsnUser) {
            return res.status(409).json({ message: `WSN ID ${customWsnId} is already taken.` });
        }
    }

    // If no custom wsnId is provided, generate a new one
    const wsnId = customWsnId || await generateWsnId();

    // Create user in MongoDB with the role and address
    const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        macAddress,
        role,  // Admin sets role (e.g., admin, user, etc.)
        address,  // Admin can set address
        wsnId,  // Use the provided or generated WSN ID
    });

    // Enqueue MikroTik creation job asynchronously
    await mikrotikQueue.add("createUser", {
        userId: newUser._id,
        username: newUser.wsnId,
        password,
        profile: profile || "default"  // Assign a default or custom profile
    });

    // Generate JWT token for the new user (optional, depending on your use case)
    const token = generateToken(newUser);

    // Send success response
    res.status(201).json({
        message: "User created successfully.",
        user: {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            wsnId: newUser.wsnId,
            macAddress: newUser.macAddress,
            role: newUser.role,  // Admin can assign role
            address: newUser.address,  // Admin can assign address
        },
        token,  // Include token in response (optional)
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


module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    getUserByWsn,
    searchUsers,
    banUser,
    forceExpireSubscription,
    updateUserRole,
    getAdminDashboard,
};
