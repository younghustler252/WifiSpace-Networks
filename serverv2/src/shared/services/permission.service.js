import { PERMISSION } from "../constants/permissions.js";

import { NotFoundError } from "../errors/not-found-error.js";
import { UnauthorizedError } from "../errors/unauthorized-error.js";

export class PermissionService {

	constructor(userRepository) {
		this.userRepository = userRepository;
	}

	async hasPermission(userId, permission) {

		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new NotFoundError("User not found");
		}

		// Super admin / full access
		if (user.permissions.includes(PERMISSION.USER.FULL_ACCESS)) {
			return true;
		}

		const allowed = user.permissions.includes(permission);

		if (!allowed) {
			throw new UnauthorizedError(
				`Missing permission: ${permission}`
			);
		}

		return true;
	}

	async hasAnyPermission(userId, permissions = []) {

		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new NotFoundError("User not found");
		}

		if (user.permissions.includes(PERMISSION.USER.FULL_ACCESS)) {
			return true;
		}

		const allowed = permissions.some(p =>
			user.permissions.includes(p)
		);

		if (!allowed) {
			throw new UnauthorizedError(
				"User does not have required permissions"
			);
		}

		return true;
	}
}