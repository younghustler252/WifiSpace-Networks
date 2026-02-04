import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getAllPlans } from "../../services/subscriptionService";
import { useDeleteSubscription } from "../../hooks/useAdmin";

import { Spinner } from "../../components/ui/Loader";
import DataTable from "../../components/ui/DataTable";
import RowActions from "../../components/ui/RowActions";
import { ROUTE } from "../../Routes/Route";

const AdminSubscriptions = () => {
	const navigate = useNavigate();
	const { data: plans = [], isPending, isError } = useQuery({
		queryKey: ["adminSubscriptions"],
		queryFn: getAllPlans,
	});

	const { mutate: deletePlan } = useDeleteSubscription();

	if (isPending) return <Spinner message="Loading subscription plans..." />;
	if (isError) return <p className="text-red-500 text-center">Failed to load plans.</p>;

	const columns = [
		{ key: "plan", label: "Plan" },
		{ key: "price", label: "Price" },
		{ key: "speed", label: "Speed" },
		{ key: "duration", label: "Duration" },
		{ key: "actions", label: "" }, // no header for actions
	];

	const handleRowClick = (planId) => {
		navigate(`${ROUTE.adminSubscriptions}/edit/${planId}`);
	};

	return (
		<div className="max-w-5xl mx-auto p-6 space-y-6">

			{/* Header */}
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-primary">Subscription Plans</h1>
				<button
					onClick={() => navigate(`${ROUTE.adminSubscriptions}/create`)}
					className="px-4 py-2 bg-accent text-white rounded-lg shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.4)]"
				>
					+ Create Plan
				</button>
			</div>

			{/* DataTable */}
			<DataTable
				columns={columns}
				data={plans}
				onRowClick={(plan) => handleRowClick(plan._id)}
				renderCell={(plan, index, key) => {
					const inUse = plan.activeUsersCount > 0;

					switch (key) {
						case "plan":
							return plan.planName;
						case "price":
							return `$${plan.price}`;
						case "speed":
							return plan.speedRate;
						case "duration":
							return `${plan.durationDays} days`;
						case "actions":
							return (
								<RowActions
									actions={[
										{
											label: "Edit",
											onClick: (e) => {
												e.stopPropagation();
												handleRowClick(plan._id);
											},
										},
										{
											label: "Delete",
											variant: "danger",
											disabled: inUse,
											hint: inUse ? "Plan is currently in use" : null,
											onClick: (e) => {
												e.stopPropagation();
												if (confirm(`Delete "${plan.planName}"?`)) {
													deletePlan(plan._id);
												}
											},
										},
									]}
								/>
							);
						default:
							return null;
					}
				}}
			/>
		</div>
	);
};

export default AdminSubscriptions;
