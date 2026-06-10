import { MobileDataCard } from "@/components/ui/MobileDataCard";

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
							<span className="ui-badge">
								{a.profileStatus}
							</span>
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