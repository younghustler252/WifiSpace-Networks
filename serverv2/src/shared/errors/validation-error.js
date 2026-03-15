import { AppError } from "./app-error.js";

export class ValidationError extends AppError {
	constructor(message = "Validation failed", details = null) {
		super(message, 400, "VALIDATION_ERROR", details);
	}
}