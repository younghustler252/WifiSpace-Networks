import type { RouterStatus } from "../api/router.types";


export default function RouterStatusBadge({
	status,
}: {
	status: RouterStatus;
}) {

	const styles =
		status === "online"
			? "bg-green-100 text-green-700"
			: status === "maintenance"
			? "bg-yellow-100 text-yellow-700"
			: "bg-red-100 text-red-700";


	return (
		<span
			className={`
				text-xs
				px-2
				py-1
				rounded-full
				${styles}
			`}
		>
			{status}
		</span>
	);
}