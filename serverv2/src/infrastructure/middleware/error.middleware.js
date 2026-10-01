import { AppError, ERROR_CODES } from "../../shared/errors/domain.errors.js";


export const errorMiddleware = (err, req, res, next) => {
	console.error(err);

	const error = err instanceof AppError
		? err
		: new AppError(err.message || "Internal Server Error", 500, ERROR_CODES.INTERNAL_ERROR);

	const payload = {
		success: false,
		code: error.code,
		message: error.message,
		...(error.details ? { details: error.details } : {})
	};

	if (process.env.NODE_ENV === "development") {
		payload.stack = error.stack;
	}

	return res.status(error.statusCode).json(payload);
};