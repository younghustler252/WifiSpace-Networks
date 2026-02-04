const StatusBadge = ({ status }) => {
	const isActive = status === "active";

	return (
		<span
			className={`
				badge
				${isActive ? "badge-success" : "badge-danger"}
			`}
		>
			{isActive ? "Active" : "Suspended"}
		</span>
	);
};

export default StatusBadge;
