import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateSubscription, useMikrotikProfiles } from "../../hooks/useAdmin";

const AdminCreateSubscription = () => {
	const navigate = useNavigate();
	const { mutate: createPlan, isPending } = useCreateSubscription();
	const { data, isLoading: profilesLoading, isError: profilesError } = useMikrotikProfiles();

	const profiles = Array.isArray(data?.data?.profiles) ? data.data.profiles : [];

	const formRef = useRef(null);

	const [form, setForm] = useState({
		planName: "",
		price: "",
		speedRate: "",
		devicesAllowed: "",
		features: "",
		durationDays: "30",
		mikrotikProfile: "",
	});

	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	useEffect(() => {
		if (errorMessage && formRef.current) {
			formRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [errorMessage]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (isPending) return;

		if (!form.planName || !form.price || !form.speedRate) {
			setErrorMessage("Plan name, price and speed rate are required");
			return;
		}

		setErrorMessage("");
		setSuccessMessage("");

		const payload = {
			planName: form.planName.trim(),
			price: Number(form.price),
			speedRate: form.speedRate.trim(),
			devicesAllowed: form.devicesAllowed ? Number(form.devicesAllowed) : undefined,
			durationDays: Number(form.durationDays) || 30,
			features: form.features
				? form.features.split(",").map(f => f.trim())
				: [],
			mikrotikProfile: form.mikrotikProfile || undefined,
		};

		createPlan(payload, {
			onSuccess: () => {
				setSuccessMessage("Subscription plan created successfully ✅");
				setTimeout(() => navigate("/admin/subscriptions"), 1200);
			},
			onError: (error) => {
				setErrorMessage(
					error?.response?.data?.message ||
					error?.message ||
					"Failed to create subscription plan"
				);
			},
		});
	};

	return (
		<div ref={formRef} className="max-w-3xl mx-auto p-6 space-y-6">
			<h1 className="text-2xl font-bold text-primary">Create Subscription Plan</h1>

			<form onSubmit={handleSubmit} className="space-y-5 bg-surface p-6 rounded-xl shadow-card">
				{errorMessage && (
					<div className="p-3 bg-badge-danger-bg text-danger rounded-lg">
						{errorMessage}
					</div>
				)}

				{successMessage && (
					<div className="p-3 bg-badge-success-bg text-success rounded-lg">
						{successMessage}
					</div>
				)}

				{/* Plan Name */}
				<div>
					<label className="block mb-1 text-primary">Plan Name *</label>
					<input
						name="planName"
						value={form.planName}
						onChange={handleChange}
						required
						className="w-full input"
					/>
				</div>

				{/* Price */}
				<div>
					<label className="block mb-1 text-primary">Price *</label>
					<input
						type="number"
						name="price"
						value={form.price}
						onChange={handleChange}
						required
						className="w-full input"
					/>
				</div>

				{/* Speed Rate */}
				<div>
					<label className="block mb-1 text-primary">Speed Rate *</label>
					<input
						name="speedRate"
						value={form.speedRate}
						onChange={handleChange}
						required
						placeholder="e.g. 10Mbps / 5Mbps"
						className="w-full input"
					/>
					<p className="text-xs text-muted mt-1">
						Use a clear format like 10Mbps / 5Mbps
					</p>
				</div>

				{/* Duration */}
				<div>
					<label className="block mb-1 text-primary">Duration</label>
					<select
						name="durationDays"
						value={form.durationDays}
						onChange={handleChange}
						className="w-full input"
					>
						<option value="7">7 days</option>
						<option value="14">14 days</option>
						<option value="30">30 days</option>
						<option value="90">90 days</option>
					</select>
				</div>

				{/* Mikrotik */}
				<div>
					<label className="block mb-1 text-primary">Mikrotik Profile (optional)</label>
					<select
						name="mikrotikProfile"
						value={form.mikrotikProfile}
						onChange={handleChange}
						className="w-full input"
					>
						<option value="">None</option>
						{profiles.map(profile => (
							<option key={profile} value={profile}>{profile}</option>
						))}
					</select>

					<p className="text-xs mt-1 text-muted">
						{profilesLoading && "Loading Mikrotik profiles..."}
						{profilesError && "Mikrotik not available (optional)"}
					</p>
				</div>

				<button
					type="submit"
					disabled={isPending}
					className="w-full btn btn-primary"
				>
					{isPending ? "Creating plan..." : "Create Plan"}
				</button>
			</form>
		</div>
	);
};

export default AdminCreateSubscription;
