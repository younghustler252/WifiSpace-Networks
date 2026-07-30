import { ValidationError } from "../../../shared/errors/validation-error.js";

export class ResolveHotspotSession {
	constructor({
		hotspotSessionRepository,
		accountRepository,
		userRepository,
		subscriptionRepository,
		planRepository
	}) {
		this.hotspotSessionRepository = hotspotSessionRepository;
		this.accountRepository = accountRepository;
		this.userRepository = userRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
	}

	async execute({ macAddress }) {
		if (!macAddress) {
			throw new ValidationError("macAddress is required");
		}

		const session =
			await this.hotspotSessionRepository.findActiveByMac(macAddress);

		if (!session) {
			return null;
		}

		const user =
			await this.userRepository.findById(session.userId);

		const account =
			await this.accountRepository.findById(session.accountId);

		if (!user || !account) {
			return null;
		}

		const subscription =
			await this.subscriptionRepository.findActiveByAccount(account.id);

		let plan = null;

		if (subscription?.planId) {
			plan = await this.planRepository.findById(subscription.planId);
		}

		return {
			session,
			user,
			account,
			subscription,
			plan
		};
	}
}