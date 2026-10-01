import { SERVICE_TYPES } from "../../../../shared/constants/service-type.enum.js";

export class GetHotspotPlans {
	constructor({ planRepository }) {
		this.planRepository = planRepository;
	}

	async execute() {
		const { data } = await this.planRepository.paginate({ filter: { serviceType: SERVICE_TYPES.HOTSPOT, status: "active" }, limit: 100, sort: { price: 1 } });
		return data;
	}
}