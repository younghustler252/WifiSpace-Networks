import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../domain/user.enum.js";

export class GetMyProfile {
	constructor({ userRepository }) {
		this.userRepository = userRepository;
	}

	async execute({ userId }) {
		const user = await this.userRepository.findById(userId);
		if (!user) throw new NotFoundError("User not found", USER_ERROR_CODES.USER_NOT_FOUND);
		return user;
	}
}