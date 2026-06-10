import { successResponse } from "../../../../shared/utils/api-response.js";

export class UsageController {
    constructor({
        syncUsage,
        getUsage,
        getAllUsages
    }) {
        this.syncUsageUseCase = syncUsage;
        this.getUsageUseCase = getUsage;
        this.getAllUsagesUseCase = getAllUsages;
    }

    // ==================================================
    // SYNC USAGE
    // ==================================================
    syncUsage = async (req, res) => {
        const { routerId, serviceType } = req.body;

        await this.syncUsageUseCase.execute(routerId, serviceType);

        return successResponse({
            res,
            data: null,
            message: "Usage synced successfully",
            code: "USAGE_SYNCED",
            statusCode: 200
        });
    };

    // ==================================================
    // GET SINGLE USAGE
    // ==================================================
    getUsage = async (req, res) => {
        const { accountId } = req.params;

        const data =
            await this.getUsageUseCase.execute(accountId);

        return successResponse({
            res,
            data,
            message: "Usage retrieved",
            code: "USAGE_GET",
            statusCode: 200
        });
    };

    // ==================================================
    // GET ALL USAGES (ADMIN)
    // ==================================================
    getAllUsages = async (req, res) => {
        const {
            page = 1,
            limit = 20,
            ...filters
        } = req.query;

        const result =
            await this.getAllUsagesUseCase.execute(
                filters,
                Number(page),
                Number(limit)
            );

        return successResponse({
            res,
            data: result.data,
            meta: result.meta,
            message: "Usage list retrieved",
            code: "USAGE_LIST",
            statusCode: 200
        });
    };
}