import { AppError } from "../errors/app-error.js";

export const errorMiddleware = (err, req, res, next) => {
	let error = err;

	// If error is not operational, convert it
	if (!(error instanceof AppError)) {
		error = new AppError(
			error.message || "Internal Server Error",
			500,
			"INTERNAL_SERVER_ERROR"
		);
	}

	// Development response
	if (process.env.NODE_ENV === "development") {
		return res.status(error.statusCode).json({
			success: false,
			code: error.code,
			message: error.message,
			details: error.details,
			stack: error.stack
		});
	}

	// Production response (no stack)
	return res.status(error.statusCode).json({
		success: false,
		code: error.code,
		message: error.message
	});
};