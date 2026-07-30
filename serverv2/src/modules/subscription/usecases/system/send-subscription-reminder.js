export class SendSubscriptionReminder {

	constructor({
		subscriptionRepository,
		mailService
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.mailService = mailService;
	}


	async execute() {

		const now = new Date();

		const reminderDays = [5, 2, 0];


		for (const days of reminderDays) {

			const start = new Date(now);
			start.setDate(
				start.getDate() + days
			);
			start.setHours(0, 0, 0, 0);


			const end = new Date(start);
			end.setHours(23, 59, 59, 999);


			const subscriptions =
				await this.subscriptionRepository.findExpiringBetween(
					start,
					end
				);


			for (const subscription of subscriptions) {

				if (
					subscription.remindersSent.includes(days)
				) {
					continue;
				}


				await this.mailService.sendNotification({
					to: subscription.user.email,
					name: subscription.user.firstName,
					subject: "Subscription Expiry Reminder",
					message: `
Hello ${subscription.user.firstName},

Your subscription will expire in ${days} day(s).

Please renew your subscription before expiry to avoid service interruption.

Thank you.
					`
				});


				subscription.remindersSent.push(days);


				await this.subscriptionRepository.update(
					subscription.id,
					subscription
				);
			}
		}
	}
}