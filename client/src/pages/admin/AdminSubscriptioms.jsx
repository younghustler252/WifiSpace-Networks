import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getAllPlans } from "../../services/subscriptionService";
import { useDeleteSubscription } from "../../hooks/useAdmin";

import { Spinner } from "../../components/ui/Loader";
import DataTable from "../../components/ui/DataTable";
import RowActions from "../../components/ui/RowActions";

const AdminSubscriptions = () => {
    const navigate = useNavigate();

    const { data: plans = [], isLoading, isError } = useQuery({
        queryKey: ["adminSubscriptions"],
        queryFn: getAllPlans,
    });

    const { mutate: deletePlan } = useDeleteSubscription();

    if (isLoading) return <Spinner message="Loading subscription plans..." />;
    if (isError) return <p className="text-red-500 text-center">Failed to load plans.</p>;

    const columns = [
        { key: "plan", label: "Plan" },
        { key: "price", label: "Price" },
        { key: "speed", label: "Speed" },
        { key: "duration", label: "Duration" },
        { key: "actions", label: "" }, // modern: no "Actions" header
    ];

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary">Subscription Plans</h1>
                <button
                    onClick={() => navigate("/admin/subscriptions/create")}
                    className="px-4 py-2 bg-accent text-white rounded-lg shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.4)]"
                >
                    + Create Plan
                </button>
            </div>

            <DataTable
                columns={columns}
                data={plans}
                renderRow={(plan) => {
                    const inUse = plan.activeUsersCount > 0;

                    return (
                        <tr
                            key={plan._id}
                            className="group hover:bg-[rgb(var(--border-color)/0.1)] dark:hover:bg-[rgb(var(--border-color)/0.1)] transition-colors"
                        >
                            <td className="py-3 px-3 font-medium cursor-pointer" onClick={() => navigate(`/admin/subscriptions/edit/${plan._id}`)}>
                                {plan.planName}
                            </td>
                            <td className="py-3 px-3 cursor-pointer" onClick={() => navigate(`/admin/subscriptions/edit/${plan._id}`)}>
                                ${plan.price}
                            </td>
                            <td className="py-3 px-3 cursor-pointer" onClick={() => navigate(`/admin/subscriptions/edit/${plan._id}`)}>
                                {plan.speedRate}
                            </td>
                            <td className="py-3 px-3 cursor-pointer" onClick={() => navigate(`/admin/subscriptions/edit/${plan._id}`)}>
                                {plan.durationDays} days
                            </td>
                            <td className="py-3 px-3 text-right">
                                <RowActions
                                    actions={[
                                        {
                                            label: "Edit",
                                            onClick: () => navigate(`/admin/subscriptions/edit/${plan._id}`),
                                        },
                                        {
                                            label: "Delete",
                                            variant: "danger",
                                            disabled: inUse,
                                            hint: inUse ? "Plan is currently in use" : null,
                                            onClick: () => {
                                                if (confirm(`Delete "${plan.planName}"?`)) {
                                                    deletePlan(plan._id);
                                                }
                                            },
                                        },
                                    ]}
                                />
                            </td>
                        </tr>
                    );
                }}
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
                                            onClick: () => navigate(`/admin/subscriptions/edit/${plan._id}`),
                                        },
                                        {
                                            label: "Delete",
                                            variant: "danger",
                                            disabled: inUse,
                                            hint: inUse ? "Plan is currently in use" : null,
                                            onClick: () => {
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
