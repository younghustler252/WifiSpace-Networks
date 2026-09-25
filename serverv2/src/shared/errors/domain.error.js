export const ERROR_CODES = {
	VALIDATION_ERROR: "VALIDATION_ERROR",
	NOT_FOUND: "NOT_FOUND",
	UNAUTHORIZED: "UNAUTHORIZED",
	FORBIDDEN: "FORBIDDEN",
	CONFLICT: "CONFLICT",
	TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
	TOKEN_EXPIRED: "TOKEN_EXPIRED",
	TOKEN_INVALID: "TOKEN_INVALID",
	INTERNAL_ERROR: "INTERNAL_ERROR"
};

export class AppError extends Error {
	constructor(message, statusCode = 500, code = ERROR_CODES.INTERNAL_ERROR, details = null) {
		super(message);

		this.statusCode = statusCode;
		this.code = code;
		this.details = details;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

export class ValidationError extends AppError {
	constructor(message = "Validation failed", details = null) {
		super(message, 400, ERROR_CODES.VALIDATION_ERROR, details);
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Resource not found", details = null) {
		super(message, 404, ERROR_CODES.NOT_FOUND, details);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized", details = null) {
		super(message, 401, ERROR_CODES.UNAUTHORIZED, details);
	}
}

export class ForbiddenError extends AppError {
	constructor(message = "Forbidden", details = null) {
		super(message, 403, ERROR_CODES.FORBIDDEN, details);
	}
}

export class ConflictError extends AppError {
	constructor(message = "Resource already exists", details = null) {
		super(message, 409, ERROR_CODES.CONFLICT, details);
	}
}

// For OTP lockouts, failed-login lockouts, etc. — a real state you already model.
export class TooManyRequestsError extends AppError {
	constructor(message = "Too many attempts, try again later", details = null) {
		super(message, 429, ERROR_CODES.TOO_MANY_REQUESTS, details);
	}
}

export class TokenExpiredError extends AppError {
	constructor(message = "Token expired", details = null) {
		super(message, 401, ERROR_CODES.TOKEN_EXPIRED, details);
	}
}

export class TokenInvalidError extends AppError {
	constructor(message = "Invalid token", details = null) {
		super(message, 401, ERROR_CODES.TOKEN_INVALID, details);
	}
}