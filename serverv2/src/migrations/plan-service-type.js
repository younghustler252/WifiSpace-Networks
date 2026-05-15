export async function up(db) {
	console.log("Running migration: 001-plan-service-type");

	// PERSONAL → PPPoE PERSONAL

	await db.collection("plans").updateMany(
		{ type: "personal" },
		{
			$set: {
				serviceType: "pppoe",
				accountType: "personal",

				durationValue: 30,
				durationUnit: "days",
			},

			$unset: {
				type: "",
				durationDays: "",
			},
		}
	);

	// BUSINESS → PPPoE BUSINESS

	await db.collection("plans").updateMany(
		{ type: "business" },
		{
			$set: {
				serviceType: "pppoe",
				accountType: "business",

				durationValue: 30,
				durationUnit: "days",
			},

			$unset: {
				type: "",
				durationDays: "",
			},
		}
	);

	// IF OLD DOCS HAVE durationDays

	const plans = await db.collection("plans").find({}).toArray();

	for (const plan of plans) {
		if (plan.durationDays) {
			await db.collection("plans").updateOne(
				{ _id: plan._id },
				{
					$set: {
						durationValue: plan.durationDays,
						durationUnit: "days",
					},

					$unset: {
						durationDays: "",
					},
				}
			);
		}
	}

	console.log("Migration complete");
}