export class TokenBlacklistService {
	constructor({ redisClient }) {
		this.redis = redisClient;
	}

	async revoke(token, ttlSeconds) {
		if (!token || !ttlSeconds || ttlSeconds <= 0) return;
		await this.redis.set(`blacklist:${token}`, "1", "EX", ttlSeconds);
	}

	async isRevoked(token) {
		if (!token) return false;
		const result = await this.redis.get(`blacklist:${token}`);
		return Boolean(result);
	}
}