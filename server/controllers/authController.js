const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const generateWsnId = require("../utils/generateWsnId");
const crypto = require("crypto");
const mikrotikQueue = require("../queues/mikrotikQueue");

// ---------------------------
// Validators
// ---------------------------
const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const validatePassword = (password) => password && password.length >= 6;

// ------------------------------------------------------------
// Register User
// ------------------------------------------------------------
const register = asyncHandler(async (req, res) => {
	const { firstName, lastName, email, password, macAddress, profile } = req.body;

	// Required fields
	if (!firstName || !lastName || !email)
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

	// Generate unique WSN ID
	const wsnId = await generateWsnId();

	// Optional email verification token
	const verificationToken = crypto.randomBytes(32).toString("hex");

	// Create user in MongoDB
	const newUser = await User.create({
		firstName,
		lastName,
		email,
		password,
		macAddress,
		verificationToken,
		wsnId,
	});

	// Enqueue MikroTik creation job asynchronously
	await mikrotikQueue.add("createUser", {
		userId: newUser._id,
		username: newUser.wsnId,   
		password,
		profile: profile || "default"
	});
	// Generate JWT token
	const token = generateToken(newUser);

	res.status(201).json({
		message: "Registration successful.",
		user: newUser,
		token,
	});
});

// ------------------------------------------------------------
// Login User
// ------------------------------------------------------------
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: "Email and password required." });

    const user = await User.findOne({ email });
    if (!user)
        return res.status(404).json({ message: "Invalid credentials." });

    if (!user.password)
        return res.status(400).json({ message: "This account uses Google login only." });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials." });

    // ------------------------------------
    // Ensure MikroTik user exists
    // ------------------------------------
    // await mikrotikQueue.add("ensureUserExists", {
    //     userId: user._id,
    //     wsnId: user.wsnId,
    //     password: user.routerPassword || password,
    //     profile: user.routerProfile || "default"
    // });

    const token = generateToken(user);

    res.status(200).json({
        message: "Login successful.",
        user,
        token,
    });
});



// ------------------------------------------------------------
// Verify Email
// ------------------------------------------------------------
const verifyEmail = asyncHandler(async (req, res) => {
	const { token } = req.query;

	const user = await User.findOne({ verificationToken: token });

	if (!user)
		return res.status(400).json({ message: "Invalid or expired token." });

	user.isVerified = true;
	user.verificationToken = null;
	await user.save();

	res.status(200).json({
		message: "Email verified successfully.",
	});
});

// ------------------------------------------------------------
// Get Current User (Auth Required)
// ------------------------------------------------------------
const getProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.id);

	if (!user)
		return res.status(404).json({ message: "User not found." });

	res.status(200).json(user);
});

module.exports = {
	register,
	login,
	verifyEmail,
	getProfile,
};
