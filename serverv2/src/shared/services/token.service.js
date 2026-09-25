import jwt from "jsonwebtoken";
import { TokenExpiredError, TokenInvalidError } from "../errors/domain-errors.js";

export class TokenService {
	constructor() {
		this.secret = process.env.JWT_SECRET;
		this.refreshSecret = process.env.JWT_REFRESH_SECRET;

		this.accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
		this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

		if (!this.secret) throw new Error("JWT_SECRET is not set");
		if (!this.refreshSecret) throw new Error("JWT_REFRESH_SECRET is not set");
	}

	generateAccessToken(user) {
		const payload = {
			sub: user.id || user._id,
			role: user.role,
			email: user.email
		};

		return jwt.sign(payload, this.secret, { expiresIn: this.accessExpiresIn });
	}

	generateRefreshToken(user) {
		const payload = { sub: user.id || user._id };
		return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiresIn });
	}

	verifyAccessToken(token) {
		try {
			return jwt.verify(token, this.secret);
		} catch (err) {
			if (err.name === "TokenExpiredError") throw new TokenExpiredError("Access token expired");
			throw new TokenInvalidError("Invalid access token");
		}
	}

	verifyRefreshToken(token) {
		try {
			return jwt.verify(token, this.refreshSecret);
		} catch (err) {
			if (err.name === "TokenExpiredError") throw new TokenExpiredError("Refresh token expired");
			throw new TokenInvalidError("Invalid refresh token");
		}
	}

	decode(token) {
		return jwt.decode(token);
	}
}