"use client";

interface Props {
	progress: number;
	daysLeft: number;
}

// Function to calculate a single solid color based on progress percentage
function getRingColor(progress: number): string {
	if (progress >= 75) {
		// 100% to 75%: Vibrant Green to Light Green
		return "#22c55e"; 
	} else if (progress >= 50) {
		// 74% to 50%: Light Green / Yellow-Green
		return "#84cc16"; 
	} else if (progress >= 25) {
		// 49% to 25%: Warning Yellow
		return "#eab308"; 
	} else if (progress > 0) {
		// 24% to 1%: Urgent Orange
		return "#f97316"; 
	} else {
		// 0%: Expired Red
		return "#dc2626"; 
	}
}

export default function SubscriptionRing({
	progress,
	daysLeft,
}: Props) {

	const size = 320;
	const stroke = 24;
	const radius = (size - stroke) / 2;
	const circumference = 2 * Math.PI * radius;

	// Clamp progress between 0 and 100
	const validatedProgress = Math.max(0, Math.min(100, progress));

	const strokeDashoffset =
		circumference - (validatedProgress / 100) * circumference;

	// Dynamic single color for the active ring
	const activeColor = getRingColor(validatedProgress);

	return (
		<div className="flex justify-center w-full max-w-[320px] aspect-square mx-auto">

			<svg
				viewBox={`0 0 ${size} ${size}`}
				className="w-full h-full overflow-hidden"
			>
				{/* Premium Dark Red Base Ring (Visible as active ring drains) */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="#7f1d1d" // Deep crimson red background color
					strokeWidth={stroke}
				/>

				{/* Active Subscription Overlay (Single shifting solid color) */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={activeColor} // Changes completely based on percentage
					strokeWidth={stroke}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					transform={`rotate(-90 ${size / 2} ${size / 2})`}
					style={{
						transition: "stroke-dashoffset 0.8s ease, stroke 0.5s ease",
					}}
				/>

				{/* Days Display */}
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
					{Math.round(validatedProgress)}%
				</text>

			</svg>

		</div>
	);
}
