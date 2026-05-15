import { UserRepository } from "../user/domain/user.repository.js";
import { AccountRepository } from "../account/infrastructure/repositories/account.repository.mongo.js";
import { SubscriptionRepository } from "../subscription/infrastructure/repositories/subscription.repository.mongo.js";
import { PaymentRepository } from "../payments/infrastructure/repositories/payment.repository.mongo.js";
import { GetDashboardStats } from "./usecases/admin/get-dashboard-stats.js";

// Instantiate repositories
const userRepository = new UserRepository();
const accountRepository = new AccountRepository();
const subscriptionRepository = new SubscriptionRepository();
const paymentRepository = new PaymentRepository();

// Instantiate use case
const getDashboardStatsUseCase = new GetDashboardStats(
    userRepository,
    accountRepository,
    subscriptionRepository,
    paymentRepository
);

export { getDashboardStatsUseCase };