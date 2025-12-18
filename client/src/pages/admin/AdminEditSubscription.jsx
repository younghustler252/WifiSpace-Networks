import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllPlans } from "../../services/subscriptionService";
import { useUpdateSubscription } from "../../hooks/useAdmin";
import { useParams, useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import BackButton from "../../components/ui/BackButton";

const AdminEditSubscription = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: plans, isLoading: loadingPlans } = useQuery({
        queryKey: ["adminSubscriptions"],
        queryFn: getAllPlans,
    });

    const plan = plans?.find((p) => p._id === id);
    const { mutate: updatePlan, isLoading } = useUpdateSubscription();

    const [form, setForm] = useState(null);

    useEffect(() => {
        if (plan) {
            setForm({
                planName: plan.planName,
                price: plan.price,
                speedRate: plan.speedRate,
                devicesAllowed: plan.devicesAllowed,
                features: plan.features.join(", "),
                mikrotikProfile: plan.mikrotikProfile,
                durationDays: plan.durationDays,
                description: plan.description,
            });
        }
    }, [plan]);

    if (loadingPlans || !plan || !form)
        return <p className="text-center p-6">Loading...</p>;

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            ...form,
            features: form.features.split(",").map((f) => f.trim()),
        };

        updatePlan({ id, updates: payload }, { onSuccess: () => navigate("/admin/subscriptions") });
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">

            {/* Back Button */}
            <BackButton />

            {/* Page Header */}
            <h1 className="text-2xl font-bold text-primary">Edit Subscription Plan</h1>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-surface p-6 rounded-2xl shadow-md hover:shadow-lg transition"
            >
                <Input
                    label="Plan Name"
                    name="planName"
                    value={form.planName}
                    onChange={handleChange}
                    placeholder="Enter plan name"
                />

                <Input
                    label="Price ($)"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Enter price"
                />

                <Input
                    label="Speed Rate"
                    name="speedRate"
                    value={form.speedRate}
                    onChange={handleChange}
                    placeholder="e.g., 100Mbps"
                />

                <Input
                    label="Devices Allowed"
                    name="devicesAllowed"
                    type="number"
                    value={form.devicesAllowed}
                    onChange={handleChange}
                    placeholder="Number of devices"
                />

                <Input
                    label="Features (comma separated)"
                    name="features"
                    value={form.features}
                    onChange={handleChange}
                    placeholder="Feature1, Feature2, Feature3"
                />

                <Input
                    label="MikroTik Profile"
                    name="mikrotikProfile"
                    value={form.mikrotikProfile}
                    onChange={handleChange}
                    placeholder="MikroTik profile name"
                />

                <Input
                    label="Duration (Days)"
                    name="durationDays"
                    type="number"
                    value={form.durationDays}
                    onChange={handleChange}
                    placeholder="Number of days"
                />

                <Input
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Plan description"
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary text-white rounded-lg w-full hover:bg-primary/90 transition"
                >
                    {isLoading ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
};

export default AdminEditSubscription;
