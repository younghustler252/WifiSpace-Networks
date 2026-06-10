// src/shared/middleware/auth.middleware.js

import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/unauthorized-error.js";
import { ForbiddenError } from "../errors/forbidden-error.js";

export function authMiddleware({ userRepository }) {
	return function (requiredRoles = []) {
		return async (req, res, next) => {
			try {
				const authHeader = req.headers.authorization;

				if (!authHeader || !authHeader.startsWith("Bearer ")) {
					throw new UnauthorizedError("Missing token", "NO_TOKEN");
				}

				const token = authHeader.split(" ")[1];

				let payload;
				try {
					payload = jwt.verify(token, process.env.JWT_SECRET);
				} catch {
					throw new UnauthorizedError("Invalid or expired token", "INVALID_TOKEN");
				}

				const user = await userRepository.findById(payload.sub);

				if (!user) {
					throw new UnauthorizedError("Invalid token user", "INVALID_TOKEN_USER");
				}

				if (requiredRoles.length && !requiredRoles.includes(user.role)) {
					throw new ForbiddenError("Insufficient role", "ROLE_FORBIDDEN");
				}

				req.user = user;
				next();
			} catch (err) {
				next(err);
			}
		};
	};
}