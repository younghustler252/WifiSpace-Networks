// modules/shared/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import { UserRepositoryMongo } from "../../../user/infrastructure/database/mongoose/repositories/user.repository.mongo.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import { ForbiddenError } from "../../../shared/errors/forbidden-error.js";

const userRepo = new UserRepositoryMongo();

export const authMiddleware = (requiredRoles = []) => {
	return async (req, res, next) => {
		try {
			// 1️⃣ Extract token
			const authHeader = req.headers["authorization"];
			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				throw new UnauthorizedError("Missing token", "NO_TOKEN");
			}

			const token = authHeader.split(" ")[1];

			// 2️⃣ Verify JWT
			let payload;
			try {
				payload = jwt.verify(token, process.env.JWT_SECRET);
			} catch (err) {
				throw new UnauthorizedError("Invalid or expired token", "INVALID_TOKEN");
			}

			const userId = payload.sub;
			const tokenPwdTimestamp = payload.pwd || null;

			// 3️⃣ Fetch user
			const user = await userRepo.findById(userId);

			if (!user) {
				throw new UnauthorizedError("Invalid token user", "INVALID_TOKEN_USER");
			}

			// 4️⃣ Check password change invalidation
			if (user.passwordChangedAt) {
				const pwdTs = user.passwordChangedAt.getTime();
				if (tokenPwdTimestamp && pwdTs > tokenPwdTimestamp) {
					throw new UnauthorizedError("Token invalid due to password change", "PASSWORD_CHANGED");
				}
			}

			// 5️⃣ Check account status
			if (user.status !== "active") {
				throw new ForbiddenError(
					`Account is ${user.status}`,
					`ACCOUNT_${user.status.toUpperCase()}`
				);
			}

			// 6️⃣ Check lock
			if (user.isLocked()) {
				throw new ForbiddenError(
					"Account temporarily locked due to failed login attempts",
					"ACCOUNT_LOCKED"
				);
			}

			// 7️⃣ Role check (if roles provided)
			if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
				throw new ForbiddenError(
					"Insufficient role",
					"ROLE_FORBIDDEN"
				);
			}

			// 8️⃣ Impersonation support
			const impersonateId = req.headers["x-impersonate-user"];
			if (impersonateId) {
				// Only superadmin can impersonate
				if (user.role !== "superadmin") {
					throw new ForbiddenError(
						"Impersonation not allowed",
						"IMPERSONATION_DENIED"
					);
				}
				const impersonatedUser = await userRepo.findById(impersonateId);
				if (!impersonatedUser) {
					throw new ForbiddenError(
						"Impersonation target not found",
						"IMPERSONATION_TARGET_NOT_FOUND"
					);
				}
				req.user = impersonatedUser; // downstream sees impersonated user
				req.isImpersonated = true;
			} else {
				req.user = user;
				req.isImpersonated = false;
			}

			next();
		} catch (err) {
			next(err);
		}
	};
};