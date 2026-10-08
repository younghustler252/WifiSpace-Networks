// infrastructure/middleware/error.middleware.js
import multer from "multer";
import { AppError, ValidationError, ERROR_CODES } from "../../shared/errors/domain.errors.js";

const FALLBACK_MESSAGES = {
	400: "The request could not be processed",
	401: "Authentication required",
	403: "You do not have permission to do that",
	404: "Not found",
	409: "This conflicts with the current state",
	413: "Request body is too large",
	422: "The request could not be processed",
	429: "Too many requests. Please slow down",
	500: "Something went wrong on our side. Please try again",
	503: "The service is temporarily unavailable"
};

export const errorMiddleware = (err, req, res, next) => {
	console.error(err);
	if (res.headersSent) return next(err);

	let error = err;

	if (err instanceof multer.MulterError) {
		error = new ValidationError(err.message);
	} else if (err?.type === "entity.parse.failed") {
		error = new ValidationError("Request body is not valid JSON");
	} else if (err?.type === "entity.too.large") {
		error = new AppError("Request body is too large", 413, ERROR_CODES.VALIDATION_ERROR);
	} else if (!(err instanceof AppError)) {
		const expose = process.env.NODE_ENV === "development" && err?.message;
		error = new AppError(expose ? err.message : FALLBACK_MESSAGES[500], 500, ERROR_CODES.INTERNAL_ERROR);
	}

	const payload = {
		success: false,
		code: error.code,
		message: error.message?.trim() || FALLBACK_MESSAGES[error.statusCode] || FALLBACK_MESSAGES[500],
		...(error.details ? { details: error.details } : {})
	};

	if (process.env.NODE_ENV === "development") payload.stack = err?.stack ?? error.stack;

	return res.status(error.statusCode).json(payload);
};