export const ERROR_CODES = {
	VALIDATION_ERROR: "VALIDATION_ERROR",
	NOT_FOUND: "NOT_FOUND",
	UNAUTHORIZED: "UNAUTHORIZED",
	FORBIDDEN: "FORBIDDEN",
	CONFLICT: "CONFLICT",
	TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
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
	constructor(message = "Validation failed", code = ERROR_CODES.VALIDATION_ERROR, details = null) {
		super(message, 400, code, details);
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Resource not found", code = ERROR_CODES.NOT_FOUND, details = null) {
		super(message, 404, code, details);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized", code = ERROR_CODES.UNAUTHORIZED, details = null) {
		super(message, 401, code, details);
	}
}

export class ForbiddenError extends AppError {
	constructor(message = "Forbidden", code = ERROR_CODES.FORBIDDEN, details = null) {
		super(message, 403, code, details);
	}
}

export class ConflictError extends AppError {
	constructor(message = "Resource already exists", code = ERROR_CODES.CONFLICT, details = null) {
		super(message, 409, code, details);
	}
}

export class TooManyRequestsError extends AppError {
	constructor(message = "Too many attempts, try again later", code = ERROR_CODES.TOO_MANY_REQUESTS, details = null) {
		super(message, 429, code, details);
	}
}

export class TokenExpiredError extends AppError {
	constructor(message = "Token expired", code = ERROR_CODES.TOKEN_EXPIRED, details = null) {
		super(message, 401, code, details);
	}
}

export class TokenInvalidError extends AppError {
	constructor(message = "Invalid token", code = ERROR_CODES.TOKEN_INVALID, details = null) {
		super(message, 401, code, details);
	}
}