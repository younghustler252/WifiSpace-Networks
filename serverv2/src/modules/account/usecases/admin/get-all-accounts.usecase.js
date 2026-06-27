import {
    ACCOUNT_TYPE_LIST,
    PROFILE_STATUS_LIST,
    SERVICE_TYPE_LIST,
} from "../../domain/account.enum.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetAllAccounts {
    constructor({ accountRepository, permissionService }) {
        this.accountRepository = accountRepository;
        this.permissionService = permissionService;
    }

    async execute(currentUser, params = {}) {
        if (!currentUser) {
            throw new Error("Unauthorized");
        }

        const {
            accountType,
            serviceType,
            profileStatus,
            userId,
            routerId,
            search,
            createdAfter,
            createdBefore,
            sort = "wsnid_desc",
            skip = 0,
            limit = 50,
        } = params;

        // ----------------------------
        // VALIDATION
        // ----------------------------
        if (accountType && !ACCOUNT_TYPE_LIST.includes(accountType)) {
            throw new ValidationError(`Invalid accountType: ${accountType}`);
        }

        if (serviceType && !SERVICE_TYPE_LIST.includes(serviceType)) {
            throw new ValidationError(`Invalid serviceType: ${serviceType}`);
        }

        if (profileStatus && !PROFILE_STATUS_LIST.includes(profileStatus)) {
            throw new ValidationError(`Invalid profileStatus: ${profileStatus}`);
        }

        // ----------------------------
        // QUERY
        // ----------------------------
        const query = {};

        if (accountType) query.accountType = accountType;
        if (serviceType) query.serviceType = serviceType;
        if (profileStatus) query.profileStatus = profileStatus;
        if (userId) query.userId = userId;
        if (routerId) query.routerId = routerId;

        if (createdAfter || createdBefore) {
            query.createdAt = {};

            if (createdAfter) {
                query.createdAt.$gte = new Date(createdAfter);
            }

            if (createdBefore) {
                query.createdAt.$lte = new Date(createdBefore);
            }
        }

        // ----------------------------
        // SEARCH
        // ----------------------------
        if (search?.trim()) {
            const term = search.trim();

            query.$or = [
                { wsnId: { $regex: term, $options: "i" } },
                { businessName: { $regex: term, $options: "i" } },
                { companyRegistrationNumber: { $regex: term, $options: "i" } },
                { taxId: { $regex: term, $options: "i" } },
                { routerProfile: { $regex: term, $options: "i" } },
            ];
        }

        // ----------------------------
        // SORTING
        // ----------------------------
        const sortOptions = {
            wsnid_desc: { wsnId: -1 },
            wsnid_asc: { wsnId: 1 },
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
        };

        const safeSort = sortOptions[sort] || sortOptions.wsnid_desc;

        // ----------------------------
        // PAGINATION
        // ----------------------------
        const safeLimit = Math.min(Number(limit) || 50, 100);
        const safeSkip = Math.max(Number(skip) || 0, 0);

        return await this.accountRepository.findAll(
            query,
            safeSort,
            safeSkip,
            safeLimit
        );
    }
}