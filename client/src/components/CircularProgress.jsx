import React from "react";

const CircularProgress = ({ percent }) => {
	const radius = 42;
	const stroke = 6;
	const normalizedRadius = radius - stroke * 2;
	const circumference = normalizedRadius * 2 * Math.PI;
	const strokeDashoffset =
		circumference - (percent / 100) * circumference;

	const getColor = () => {
		if (percent >= 70) return "#22c55e"; // green
		if (percent >= 30) return "#eab308"; // yellow
		return "#ef4444"; // red
	};

	return (
		<svg
			height={radius * 2}
			width={radius * 2}
			className="transform -rotate-90"
		>
			<circle
				stroke="#e5e7eb"
				fill="transparent"
				strokeWidth={stroke}
				r={normalizedRadius}
				cx={radius}
				cy={radius}
			/>
			<circle
				stroke={getColor()}
				fill="transparent"
				strokeWidth={stroke}
				r={normalizedRadius}
				cx={radius}
				cy={radius}
				strokeDasharray={`${circumference} ${circumference}`}
				strokeDashoffset={strokeDashoffset}
				strokeLinecap="round"
				className="transition-all duration-500"
			/>
			<text
				x="50%"
				y="50%"
				dy="0.35em"
				textAnchor="middle"
				className="font-bold text-sm"
				fill={getColor()}
			>
				{percent}%
			</text>
		</svg>
	);
};

export default CircularProgress;
