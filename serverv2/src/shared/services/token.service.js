import jwt from "jsonwebtoken";

export class TokenService {
	constructor({ secret, refreshSecret, accessExpiresIn = "15m", refreshExpiresIn = "7d", tokenBlacklist }) {
		this.secret = secret;
		this.refreshSecret = refreshSecret;
		this.accessExpiresIn = accessExpiresIn;
		this.refreshExpiresIn = refreshExpiresIn;
		this.tokenBlacklist = tokenBlacklist; // optional, could be Redis or in-memory
	}

	// ----------------------------
	// Generate Access & Refresh Tokens
	// ----------------------------
	generateAccessToken(payload) {
		return jwt.sign(payload, this.secret, { expiresIn: this.accessExpiresIn });
	}

	generateRefreshToken(payload) {
		return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiresIn });
	}

	// ----------------------------
	// Verify Tokens
	// ----------------------------
	verifyAccessToken(token) {
		if (this.tokenBlacklist && this.tokenBlacklist.has(token)) {
			throw new Error("Token revoked");
		}

		try {
			return jwt.verify(token, this.secret);
		} catch (err) {
			if (err.name === "TokenExpiredError") throw new Error("Access token expired");
			throw new Error("Invalid access token");
		}
	}

	verifyRefreshToken(token) {
		if (this.tokenBlacklist && this.tokenBlacklist.has(token)) {
			throw new Error("Refresh token revoked");
		}

		try {
			return jwt.verify(token, this.refreshSecret);
		} catch (err) {
			if (err.name === "TokenExpiredError") throw new Error("Refresh token expired");
			throw new Error("Invalid refresh token");
		}
	}

	// ----------------------------
	// Revoke token (for logout / blacklist)
	// ----------------------------
	revokeToken(token) {
		if (this.tokenBlacklist) {
			this.tokenBlacklist.add(token);
		}
	}

	// ----------------------------
	// Decode without verifying (optional)
	// ----------------------------
	decode(token) {
		return jwt.decode(token);
	}
}