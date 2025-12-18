const jwt = require("jsonwebtoken")
const User = require("../models/User")

// --------------------------------------------------
// PROTECT ROUTES (User must be logged in)
// --------------------------------------------------
const protect = async (req, res, next) => {
	let token;

	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer")) {
		return res.status(401).json({ message: "Not authorized, no token." });
	}

	try {
		// Extract token
		token = authHeader.split(" ")[1];

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Fetch user from DB
		const user = await User.findById(decoded.id).select("-password");

		if (!user) {
			return res.status(401).json({ message: "User not found." });
		}

		// Attach user to request
		req.user = user;

		// Continue to next middleware
		next();
	} catch (err) {
		console.error("JWT AUTH ERROR:", err.message);
		return res.status(401).json({ message: "Not authorized, token failed." });
	}
};


// --------------------------------------------------
// ADMIN ONLY ROUTES
// --------------------------------------------------
const admin = (req, res, next) => {
	if (req.user && req.user.role === "admin") {
		return next()
	} else {
		return res.status(403).json({ message: "Forbidden: Admins only" })
	}
}

module.exports = { protect, admin }
