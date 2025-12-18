const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const generateWsnId = require("../utils/generateWsnId");
const { OAuth2Client } = require("google-auth-library");
const { addHotspotUser } = require("../utils/routerosHelpers");
const crypto = require("crypto");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = asyncHandler(async (req, res) => {
    const { credential } = req.body;

    if (!credential)
        return res.status(400).json({ message: "Missing Google credential token." });

    // 1️⃣ VERIFY TOKEN FROM GOOGLE
    let payload;
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        payload = ticket.getPayload();
    } catch (err) {
        return res.status(401).json({ message: "Invalid Google token." });
    }

    if (!payload || !payload.sub)
        return res.status(401).json({ message: "Invalid Google token payload." });

    const { sub: googleId, email, given_name, family_name, picture } = payload;

    if (!email)
        return res.status(400).json({ message: "Google account must have an email." });

    // 2️⃣ FIND EXISTING USER
    let user = await User.findOne({ email });

    if (user && !user.googleId && user.password) {
        return res.status(400).json({
            message: "Email already registered. Login with password.",
        });
    }

    if (!user) {
        // 3️⃣ REGISTER NEW GOOGLE USER
        const wsnId = await generateWsnId();

        user = await User.create({
            firstName: given_name || "",
            lastName: family_name || "",
            email,
            profilePicture: picture,
            googleId,
            isVerified: true,
            wsnId,
        });

        // Mikrotik hotspot user
        try {
            const randomPassword = crypto.randomBytes(4).toString("hex");
            await addHotspotUser(user.wsnId, randomPassword, "default");
        } catch (err) {
            console.error("❌ Mikrotik Add Google User Error:", err);
        }

    } else {
        // Update info for returning Google user
        if (!user.googleId) user.googleId = googleId;
        if (picture && user.profilePicture !== picture) user.profilePicture = picture;
        await user.save();
    }

    // 4️⃣ Generate token
    const token = generateToken(user);

    const safeUser = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        wsnId: user.wsnId,
    };

    return res.status(200).json({
        message: "Google authentication successful.",
        user: safeUser,
        token,
    });
});

module.exports = { googleAuth };
