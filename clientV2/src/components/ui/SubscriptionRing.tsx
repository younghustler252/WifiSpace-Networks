"use client";

interface Props {
	progress: number;
	daysLeft: number;
}

export default function SubscriptionRing({
	progress,
	daysLeft,
}: Props) {

	const size = 320;
	const stroke = 24;

	const radius =
		(size - stroke) / 2;

	const circumference =
		2 * Math.PI * radius;

	const strokeDashoffset =
		circumference -
		(progress / 100) * circumference;

	return (
		<div className="flex justify-center">

			<svg
				width={size}
				height={size}
				className="overflow-visible"
			>

				<defs>

					<linearGradient
						id="subscriptionGradient"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"
					>
						<stop
							offset="0%"
							stopColor="#ef4444"
						/>

						<stop
							offset="35%"
							stopColor="#f97316"
						/>

						<stop
							offset="65%"
							stopColor="#eab308"
						/>

						<stop
							offset="100%"
							stopColor="#22c55e"
						/>

					</linearGradient>

				</defs>

				{/* Base Ring (Always Red) */}

				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="#ef4444"
					strokeWidth={stroke}
					opacity={0.2}
				/>

				{/* Remaining Subscription */}

				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="url(#subscriptionGradient)"
					strokeWidth={stroke}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					transform={`rotate(-90 ${size / 2} ${size / 2})`}
					style={{
						transition:
							"stroke-dashoffset .8s ease",
					}}
				/>

				{/* Days */}

				<text
					x="50%"
					y="46%"
					textAnchor="middle"
					className="fill-foreground font-bold text-6xl"
				>
					{daysLeft}
				</text>

				<text
					x="50%"
					y="58%"
					textAnchor="middle"
					className="fill-muted-foreground text-base"
				>
					Days Left
				</text>

				<text
					x="50%"
					y="70%"
					textAnchor="middle"
					className="fill-foreground text-sm font-medium"
				>
					{Math.round(progress)}%
				</text>

			</svg>

		</div>
	);
}