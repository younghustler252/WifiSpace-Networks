import { UnauthorizedError, ForbiddenError } from "../../shared/errors/domain.errors.js";
import { ERROR_CODES } from "../../shared/errors/domain.errors.js";
import { USER_ROLE } from "../../modules/user/domain/user.enum.js";

export const requireRoles = (...roles) => {
	return (req, res, next) => {
		if (!req.user) return next(new UnauthorizedError("Authentication required", ERROR_CODES.UNAUTHORIZED));

		if (!roles.includes(req.user.role)) {
			return next(new ForbiddenError(`Access denied. Required role: ${roles.join(", ")}`, ERROR_CODES.FORBIDDEN));
		}

		next();
	};
};

// export const requirePermissions = (...permissions) => {
// 	return (req, res, next) => {
// 		if (!req.user) return next(new UnauthorizedError("Authentication required", ERROR_CODES.UNAUTHORIZED));

// 		const hasAll = permissions.every((p) => req.user.permissions?.includes(p));
// 		if (!hasAll) {
// 			return next(new ForbiddenError(`Access denied. Required permission: ${permissions.join(", ")}`, ERROR_CODES.FORBIDDEN));
// 		}

// 		next();
// 	};
// };

export const requireSuperAdmin = requireRoles(USER_ROLE.SUPERADMIN);
export const requireStaff = requireRoles(USER_ROLE.STAFF, USER_ROLE.SUPERADMIN);

// Ownership guard reusable across account/hotspot/pppoe modules later —
// e.g. router.get("/:id", authenticate, requireOwnerOrStaff("id"), handler)
export const requireOwnerOrStaff = (paramKey = "id", userField = "id") => {
	return (req, res, next) => {
		if (!req.user) return next(new UnauthorizedError("Authentication required", ERROR_CODES.UNAUTHORIZED));

		const isStaff = [USER_ROLE.STAFF, USER_ROLE.SUPERADMIN].includes(req.user.role);
		const isOwner = req.params[paramKey] === req.user[userField];

		if (!isStaff && !isOwner) {
			return next(new ForbiddenError("You do not have access to this resource", ERROR_CODES.FORBIDDEN));
		}

		next();
	};
};