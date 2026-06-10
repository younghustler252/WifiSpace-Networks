export class GetHotspotPlans {
    constructor({ planRepository }) {
        this.planRepository = planRepository;
    }

    async execute({ page = 1, limit = 100 } = {}) {
        return this.planRepository.findAll({
            serviceType: "hotspot",
            status: "active",
            sort: "price_asc",
            page: Math.max(parseInt(page) || 1, 1),
            limit: Math.max(parseInt(limit) || 100, 1),
        });
    }
}