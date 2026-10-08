// infrastructure/middleware/idempotency.middleware.js
import crypto from "crypto";
import { AppError, ConflictError, ValidationError } from "../../shared/errors/domain.errors.js";

function onResponse(res, { onSuccess, onFailure }) {
	const originalJson = res.json.bind(res);
	res.json = (body) => {
		const ok = res.statusCode >= 200 && res.statusCode < 300;
		Promise.resolve(ok ? onSuccess(res.statusCode, body) : onFailure()).catch((error) => console.error("[idempotency]", error.message));
		return originalJson(body);
	};
}

export function idempotencyFactory({ redisClient }) {
	return function idempotent({ ttlSeconds = 86400, lockSeconds = 60, duplicateGuardSeconds = 0 } = {}) {
		return async (req, res, next) => {
			try {
				const userId = req.user?.id ?? "anon";
				const route = `${req.method}:${req.originalUrl.split("?")[0]}`;
				const fingerprint = crypto.createHash("sha256").update(JSON.stringify(req.body ?? {})).digest("hex");
				const headerKey = req.headers["idempotency-key"];

				if (!headerKey) {
					if (!duplicateGuardSeconds) return next();

					const guardKey = `dup:${userId}:${route}:${fingerprint}`;
					const acquired = await redisClient.set(guardKey, "1", "EX", duplicateGuardSeconds, "NX");
					if (!acquired) {
						return next(new ConflictError("This looks like a duplicate request. Please wait a few seconds before retrying.", "DUPLICATE_REQUEST"));
					}

					onResponse(res, { onSuccess: async () => {}, onFailure: () => redisClient.del(guardKey) });
					return next();
				}

				if (headerKey.length > 128) {
					return next(new ValidationError("Idempotency-Key is too long", "IDEMPOTENCY_KEY_INVALID"));
				}

				const storeKey = `idem:${userId}:${route}:${headerKey}`;
				const existing = await redisClient.get(storeKey);

				if (existing) {
					const record = JSON.parse(existing);
					if (record.fingerprint !== fingerprint) {
						return next(new AppError("This Idempotency-Key was already used with a different request body", 422, "IDEMPOTENCY_KEY_REUSED"));
					}
					if (record.state === "in_progress") {
						return next(new ConflictError("A request with this Idempotency-Key is still being processed", "IDEMPOTENCY_KEY_IN_PROGRESS"));
					}
					res.set("Idempotent-Replayed", "true");
					return res.status(record.statusCode).json(record.body);
				}

				const locked = await redisClient.set(storeKey, JSON.stringify({ state: "in_progress", fingerprint }), "EX", lockSeconds, "NX");
				if (!locked) {
					return next(new ConflictError("A request with this Idempotency-Key is still being processed", "IDEMPOTENCY_KEY_IN_PROGRESS"));
				}

				onResponse(res, {
					onSuccess: (statusCode, body) => redisClient.set(storeKey, JSON.stringify({ state: "completed", fingerprint, statusCode, body }), "EX", ttlSeconds),
					onFailure: () => redisClient.del(storeKey)
				});

				return next();
			} catch (error) {
				console.error("[idempotency] failing open:", error.message);
				return next();
			}
		};
	};
}