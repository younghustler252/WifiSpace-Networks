"use client";

import Card, { CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";

import {
	User,
	Mail,
	Phone,
	ArrowRight
} from "lucide-react";


export function HotspotNewUserScreen({
	onSubmit
}: {
	onSubmit: (
		data: {
			firstName: string;
			email: string;
			phone: string;
		}
	) => void;
}) {


	return (

		<Card
			className="
				w-full
				max-w-md
				mx-auto
			"
			hover={false}
		>


			<CardContent>


				<form

					className="
						flex
						flex-col
						gap-5
					"

					onSubmit={(e) => {

						e.preventDefault();

						const form =
							new FormData(
								e.currentTarget
							);


						onSubmit({

							firstName:
								form.get("firstName") as string,

							email:
								form.get("email") as string,

							phone:
								form.get("phone") as string,

						});

					}}

				>



					<div className="text-center mb-2">

						<h2 className="
							text-xl
							font-bold
						">
							Create your hotspot account
						</h2>


						<p className="
							text-sm
							text-muted-foreground
							mt-1
						">

							Your account will be activated after payment.

						</p>

					</div>





					<InputField

						label="First name"

						name="firstName"

						placeholder="Enter your first name"

						required

						leftIcon={
							<User size={16}/>
						}

					/>





					<InputField

						label="Email"

						name="email"

						type="email"

						placeholder="you@example.com"

						helperText="Used for payment receipt"

						leftIcon={
							<Mail size={16}/>
						}

					/>






					<InputField

						label="Phone number"

						name="phone"

						placeholder="08012345678"

						required

						leftIcon={
							<Phone size={16}/>
						}

						helperText="This will be used as your initial hotspot password"

					/>





					<Button

						type="submit"

						variant="accent"

						fullWidth

					>

						Continue

						<ArrowRight
							size={16}
							className="ml-2"
						/>

					</Button>



				</form>



			</CardContent>


		</Card>

	);
}