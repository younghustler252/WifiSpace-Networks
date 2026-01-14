import React from "react";
import { CheckCircle, Zap, Users } from "lucide-react";

const SubscriptionCard = ({ plan, isCurrent, onSelect }) => {
	const {
		planName,
		description,
		price,
		speedRate,
		devicesAllowed
	} = plan;

	return (
		<div
			onClick={() => onSelect(plan)}
			className={`relative p-6 rounded-2xl border cursor-pointer transition-all
				hover:scale-[1.02] hover:shadow-lg
				${isCurrent ? "border-green-500 bg-green-50/40" : "border-gray-300"}
			`}
		>
			{isCurrent && (
				<span className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">
					<CheckCircle size={14} />
					Current plan
				</span>
			)}

			<h3 className="text-xl font-bold">{planName}</h3>
			<p className="text-sm text-muted-foreground mt-1">{description}</p>

			<div className="my-4 flex items-baseline gap-1">
				<span className="text-3xl font-bold">
					₦{price.toLocaleString()}
				</span>
				<span className="text-sm text-muted-foreground">/ month</span>
			</div>

			<div className="space-y-2 text-sm text-muted-foreground">
				<div className="flex items-center gap-2">
					<Zap size={16} />
					{speedRate} Mbps speed
				</div>
				<div className="flex items-center gap-2">
					<Users size={16} />
					{devicesAllowed} devices
				</div>
			</div>
		</div>
	);
};

export default SubscriptionCard;
