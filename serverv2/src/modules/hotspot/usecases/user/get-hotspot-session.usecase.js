export class GetHotspotSession {
	constructor({ hotspotSessionRepository }) {
		this.hotspotSessionRepository = hotspotSessionRepository;
	}

	async execute({ macAddress }) {
		console.log("[GetHotspotSession] macAddress:", macAddress);

		const session = await this.hotspotSessionRepository.findByMac(macAddress);

		console.log("[GetHotspotSession] session:", session);
		console.log("[GetHotspotSession] constructor:", session?.constructor?.name);
		console.log("[GetHotspotSession] isRevoked:", typeof session?.isRevoked);

		return session;
	}
}
