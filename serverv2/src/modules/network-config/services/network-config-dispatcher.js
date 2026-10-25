import { enqueueNetworkConfigSync } from "../../../infrastructure/jobs/queues/network-config.queue.js";

export class NetworkConfigDispatcher {
	constructor({ routerRepository }) {
		this.routerRepository = routerRepository;
	}

	async enqueueRouter(routerId) {
		try {
			await enqueueNetworkConfigSync(routerId);
			return true;
		} catch (error) {
			console.error(`[NetworkConfigDispatcher] Could not queue sync for router ${routerId}:`, error.message);
			return false;
		}
	}

	async enqueueAll() {
		const { data } = await this.routerRepository.paginate({ filter: { isEnabled: true }, limit: 100 });
		let queued = 0;

		for (const router of data) {
			if (!router.supports?.("hotspot")) continue;
			if (await this.enqueueRouter(router.id)) queued++;
		}

		return queued;
	}
}
