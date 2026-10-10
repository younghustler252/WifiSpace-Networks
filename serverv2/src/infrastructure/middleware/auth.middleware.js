import {
	UnauthorizedError,
	ERROR_CODES
} from "../../shared/errors/domain.errors.js";

export function authenticateFactory({
	userRepository,
	tokenService,
	tokenBlacklistService
}) {
	return async function authenticate(req, res, next) {
		try {
			const headerToken = req.headers.authorization?.startsWith("Bearer ")
				? req.headers.authorization.split(" ")[1]
				: null;

			const token = headerToken || req.cookies?.accessToken;

			if (!token) {
				throw new UnauthorizedError(
					"Missing token",
					ERROR_CODES.UNAUTHORIZED
				);
			}

			if (tokenBlacklistService) {
				const isRevoked = await tokenBlacklistService.isRevoked(token);

				if (isRevoked) {
					throw new UnauthorizedError(
						"Token has been revoked",
						ERROR_CODES.UNAUTHORIZED
					);
				}
			}

			const payload = tokenService.verifyAccessToken(token);

			const user = await userRepository.findById(payload.sub);

			if (!user) {
				throw new UnauthorizedError(
					"User no longer exists",
					ERROR_CODES.UNAUTHORIZED
				);
			}

			req.user = user;
			req.token = token;

			return next();
		} catch (err) {
			return next(err);
		}
	};
}