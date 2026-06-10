import jwt from "jsonwebtoken";

export class TokenService {

	constructor() {

		this.secret = process.env.JWT_SECRET;
		this.refreshSecret = process.env.JWT_REFRESH_SECRET;

		this.accessExpiresIn = "15m";
		this.refreshExpiresIn = "7d";
	}

	generate(payload, expiresIn = "1h") {

		if (!this.secret) {
			throw new Error("JWT secret is not set");
		}

		return jwt.sign(payload, this.secret, {
			expiresIn
		});
	}

	// ----------------------------
	// Generate Tokens
	// ----------------------------

	generateAccessToken(payload) {

		return jwt.sign(payload, this.secret, {
			expiresIn: this.accessExpiresIn
		});
	}

	generateRefreshToken(payload) {

		return jwt.sign(payload, this.refreshSecret, {
			expiresIn: this.refreshExpiresIn
		});
	}

	// ----------------------------
	// Verify Tokens
	// ----------------------------

	verifyAccessToken(token) {

		try {

			return jwt.verify(token, this.secret);

		} catch (err) {

			if (err.name === "TokenExpiredError") {
				throw new Error("Access token expired");
			}

			throw new Error("Invalid access token");
		}
	}

	verifyRefreshToken(token) {

		try {

			return jwt.verify(token, this.refreshSecret);

		} catch (err) {

			if (err.name === "TokenExpiredError") {
				throw new Error("Refresh token expired");
			}

			throw new Error("Invalid refresh token");
		}
	}

	// ----------------------------
	// Decode
	// ----------------------------

	decode(token) {

		return jwt.decode(token);
	}
}