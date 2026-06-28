import { MobileDataCard } from "@/components/ui/MobileDataCard";
import StatusBadge from "@/components/ui/StatusBadge";

export default function AccountsMobileList({ accounts, router }: any) {
	return (
		<div className="ui-stack transition-opacity duration-200">
			{accounts.map((a: any) => (
				<div
					key={a.id || a._id}
					className="cursor-pointer"
					onClick={() =>
						router.push(`/admin/accounts/${a.id || a._id}`)
					}
				>
					<MobileDataCard
						title={`${a.accountType} • ${a.serviceType}`}
						subtitle={a.wsnId}
						badge={
							<StatusBadge variant={a.profileStatus === "active" ? "successful" : a.profileStatus === "canceled" ? "failed" : a.profileStatus} size="md" withDot>
								{a.profileStatus}
							</StatusBadge>
						}

						fields={[
							{ label: "WSNID", value: a.wsnId },
						]}
					/>
				</div>
			))}
		</div>
	);
}