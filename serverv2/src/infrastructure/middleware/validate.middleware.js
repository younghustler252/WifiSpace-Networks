import { ValidationError } from "../../shared/errors/domain.errors.js";
import { ERROR_CODES } from "../../shared/errors/domain.errors.js";

export const validate = (schema, source = "body") => {
	return (req, res, next) => {
		const result = schema.safeParse(req[source]);

		if (!result.success) {
			const details = result.error.issues.map((issue) => ({
				field: issue.path.join("."),
				message: issue.message
			}));

			return next(new ValidationError("Validation failed", ERROR_CODES.VALIDATION_ERROR, details));
		}

		if (source !== "query") {
			req[source] = result.data;
		}

		next();
	};
};
