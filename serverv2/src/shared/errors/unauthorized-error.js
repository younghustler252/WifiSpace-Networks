import { AppError } from "./app-error.js";

export class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized", code = "UNAUTHORIZED") {
		super(message, 401, code);
	}
}