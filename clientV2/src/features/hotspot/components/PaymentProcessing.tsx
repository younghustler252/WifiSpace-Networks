"use client";

import Card, { CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Loader";

export function HotspotPaymentProcessing() {
	return (
		<div className="
			flex
			items-center
			justify-center
			py-16
		">

			<Card
				className="
					w-full
					max-w-md
					text-center
				"
				hover={false}
			>

				<CardContent>

					<div className="
						flex
						flex-col
						items-center
						gap-5
					">


						<div className="
							relative
							flex
							items-center
							justify-center
						">

							<Spinner size="lg" />

						</div>



						<div>

							<h2 className="
								text-xl
								font-bold
							">

								Processing Payment

							</h2>


							<p className="
								mt-2
								text-sm
								text-muted-foreground
							">

								Please wait while we confirm your payment
								and activate your hotspot connection.

							</p>

						</div>



						<div className="
							text-xs
							text-muted-foreground
							bg-muted
							rounded-full
							px-4
							py-2
						">

							Do not close this page

						</div>


					</div>


				</CardContent>

			</Card>

		</div>
	);
}