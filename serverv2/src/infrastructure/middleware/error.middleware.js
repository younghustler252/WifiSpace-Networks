import { AppError, ERROR_CODES } from "../../shared/errors/domain.errors.js";

export const errorMiddleware = (err, req, res, next) => {
	const isAppError = err instanceof AppError;

	const error = isAppError
		? err
		: new AppError(
				"Internal Server Error",
				500,
				ERROR_CODES.INTERNAL_ERROR
			);

	if (!isAppError || error.statusCode >= 500) {
		console.error({
			method: req.method,
			url: req.originalUrl,
			ip: req.ip,
			error: err
		});
	}

	const payload = {
		success: false,
		code: error.code,
		message: error.message,
		...(error.details ? { details: error.details } : {})
	};

	if (process.env.NODE_ENV !== "production") {
		payload.stack = error.stack;
	}

	return res.status(error.statusCode).json(payload);
};