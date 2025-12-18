import { useState } from "react";
import { useCreateSubscription } from "../../hooks/useAdmin";
import { useNavigate } from "react-router-dom";

const AdminCreateSubscription = () => {
    const navigate = useNavigate();
    const { mutate: createPlan, isLoading } = useCreateSubscription();

    const [form, setForm] = useState({
        planName: "",
        price: "",
        speedRate: "",
        devicesAllowed: "",
        features: "",
        mikrotikProfile: "",
        durationDays: "",
        description: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            ...form,
            price: Number(form.price),
            devicesAllowed: Number(form.devicesAllowed),
            durationDays: Number(form.durationDays),
            features: form.features.split(",").map(f => f.trim()),
        };

        createPlan(payload, {
            onSuccess: () => navigate("/admin/subscriptions"),
        });
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold text-primary">Create Subscription Plan</h1>

            <form onSubmit={handleSubmit} className="space-y-4 bg-surface p-6 rounded-xl shadow">
                {Object.keys(form).map((key) => (
                    <div key={key}>
                        <label className="block mb-1 text-primary capitalize">{key}</label>
                        <input
                            name={key}
                            value={form[key]}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg"
                            required
                        />
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary text-white rounded-lg w-full"
                >
                    {isLoading ? "Creating..." : "Create Plan"}
                </button>
            </form>
        </div>
    );
};

export default AdminCreateSubscription;
