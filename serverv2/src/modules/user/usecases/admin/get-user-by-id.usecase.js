import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { USER_ERROR_CODES } from "../../domain/user.enum.js";

export class GetUserById {
	constructor({ userRepository }) {
		this.userRepository = userRepository;
	}

	async execute({ targetId }) {
		const user = await this.userRepository.findById(targetId);
		if (!user) throw new NotFoundError("User not found", USER_ERROR_CODES.USER_NOT_FOUND);
		return user;
	}
}