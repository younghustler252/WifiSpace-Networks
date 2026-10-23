export class GetHotspotSession {
	constructor({ hotspotSessionRepository }) {
		this.hotspotSessionRepository = hotspotSessionRepository;
	}

	async execute({ macAddress }) {
		return this.hotspotSessionRepository.findByMac(macAddress);
	}
}
