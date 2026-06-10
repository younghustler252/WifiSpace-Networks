export class GetAllUsageUseCase {
    constructor({ usageRepository }) {
        this.usageRepository = usageRepository;
    }

    async execute(filters = {}, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.usageRepository.findAll(filters, {
                skip,
                limit
            }),

            this.usageRepository.count(filters)
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }
}