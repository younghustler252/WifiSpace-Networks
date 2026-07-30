import { Account } from "../../domain/account.entity.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";

export class CreateAccount {

	constructor({
		accountRepository,
		userRepository,
		analyticsTracker
	}) {
		this.accountRepository = accountRepository;
		this.userRepository = userRepository;
		this.analyticsTracker = analyticsTracker;
	}


	async execute(data, context = {}) {

		// -----------------------------
		// CREATE ACCOUNT ENTITY
		// -----------------------------

		const account =
			new Account({
				...data,
				userId: data.userId
			});


		account.profileStatus = "pending";



		// -----------------------------
		// GENERATE ROUTER PASSWORD
		// -----------------------------

		if (!account.routerPassword) {

			try {

				const user =
					await this.userRepository.findById(
						account.userId.toString()
					);


				const userPhone =
					user?.phone;


				account.routerPassword =
					userPhone ||
					(
						account.serviceType === "hotspot"
							? "Access123"
							: "C0NN3CT@pppoe123$"
					);


			} catch (err) {

				account.routerPassword =
					account.serviceType === "hotspot"
						? "Access123"
						: "C0NN3CT@pppoe123$";

			}
		}



		// -----------------------------
		// SAVE ACCOUNT
		// -----------------------------

		const createdAccount =
			await this.accountRepository.create(
				account
			);

		// -----------------------------
		// ANALYTICS
		// -----------------------------

		try {

			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.ACCOUNT_CREATED,
				{
					accountType: createdAccount.accountType,
					serviceType: createdAccount.serviceType,
					profileStatus: createdAccount.profileStatus
				}
			);

		} catch(err) {

			console.error(
				"Analytics tracking failed:",
				err.message
			);

		}
		return {
			account: createdAccount
		};
	}
}