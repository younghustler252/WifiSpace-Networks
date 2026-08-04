import { ValidationError } from "../../../shared/errors/validation-error.js";
import { User } from "../../user/domain/user.entity.js";

export class RegisterHotspotUser {

	constructor({
		userRepository,
		passwordService,
		auditService,
		mailService
	}) {
		this.userRepository = userRepository;
		this.passwordService = passwordService;
		this.auditService = auditService;
		this.mailService = mailService;
	}


	async execute({
		firstName,
		lastName,
		email,
		phone
	}) {

		if (!firstName) {
			throw new ValidationError(
				"First name is required"
			);
		}


		if (!lastName) {
			throw new ValidationError(
				"Last name is required"
			);
		}


		if (!email) {
			throw new ValidationError(
				"Email is required"
			);
		}


		if (!phone) {
			throw new ValidationError(
				"Phone is required"
			);
		}


		const normalizedEmail =
			email.toLowerCase().trim();


		const existingUser =
			await this.userRepository.findByEmail(
				normalizedEmail
			);


		if (existingUser) {
			throw new ValidationError(
				"An account already exists with this email. Please sign in to continue."
			);
		}



		// phone becomes initial password
		const hashedPassword =
			await this.passwordService.hash(phone);



		const userEntity =
			new User({
				firstName,
				lastName,
				email: normalizedEmail,
				phone,
				hashedPassword,
				role: "customer",
				status: "active",
				isVerified: true,
				permissions: []
			});


		const user =
			await this.userRepository.create(
				userEntity
			);



		// Send login details
		// await this.mailService.sendNotification({
		// 	to: normalizedEmail,
		// 	name: firstName,
		// 	subject: "Your WiFiSpace account has been created",
		// 	message: `
		// 		Welcome ${firstName}.

		// 		Your account has been created successfully.

		// 		Login email:
		// 		${normalizedEmail}

		// 		Your temporary password is your phone number.

		// 		Please login and change your password after accessing your account.
		// 	`
		// });



		await this.auditService.log({

			actorId:user.id,

			action:"HOTSPOT_AUTO_REGISTER",

			resource:"User",

			metadata:{
				email:normalizedEmail,
				method:"HOTSPOT_PORTAL"
			}

		});


		return user;
	}
}