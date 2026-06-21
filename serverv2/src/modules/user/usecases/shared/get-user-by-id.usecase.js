// modules/user/usecases/shared/get-user-by-id.usecase.js

import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

export class GetUserById {
	constructor({ userRepository }) {
		this.userRepository = userRepository;
	}

	async execute({
		userId,
		exposeSensitive = true
	}) {
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new NotFoundError(
				"User not found",
				"USER_NOT_FOUND"
			);
		}

		return user.toJSON({
			exposeSensitive
		});
	}
}