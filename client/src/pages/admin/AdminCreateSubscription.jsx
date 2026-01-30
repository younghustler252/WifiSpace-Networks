import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
	useCreateSubscription,
	useMikrotikProfiles,
} from "../../hooks/useAdmin";

const AdminCreateSubscription = () => {
	const navigate = useNavigate();
	const formRef = useRef(null);

	const { mutate: createPlan, isPending } = useCreateSubscription();
	const { data, isLoading: profilesLoading } = useMikrotikProfiles();

	// Safely extract profiles
	const profiles = Array.isArray(data?.data?.profiles)
		? data.data.profiles
		: [];

	const [form, setForm] = useState({
		planName: "",
		price: "",
		speedRate: "",
		devicesAllowed: "",
		features: "",
		durationDays: "",
		mikrotikProfile: "", // OPTIONAL
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
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (isPending) return;

		setErrorMessage("");
		setSuccessMessage("");

		const payload = {
			planName: form.planName,
			price: Number(form.price),
			speedRate: form.speedRate,
			devicesAllowed: Number(form.devicesAllowed) || 1,
			durationDays: Number(form.durationDays) || 30,
			features: form.features
				? form.features.split(",").map((f) => f.trim())
				: [],
		};

		// ✅ Only include Mikrotik profile if selected
		if (form.mikrotikProfile) {
			payload.mikrotikProfile = form.mikrotikProfile;
		}

		createPlan(payload, {
			onSuccess: () => {
				setSuccessMessage("Subscription plan created successfully ✅");
				setForm({
					planName: "",
					price: "",
					speedRate: "",
					devicesAllowed: "",
					features: "",
					durationDays: "",
					mikrotikProfile: "",
				});
				setTimeout(() => navigate("/admin/subscriptions"), 1500);
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
			<h1 className="text-2xl font-bold text-primary">
				Create Subscription Plan
			</h1>

			<form
				onSubmit={handleSubmit}
				className="space-y-4 bg-surface p-6 rounded-xl shadow"
			>
				{errorMessage && (
					<div className="p-3 bg-red-100 text-red-700 rounded-lg">
						{errorMessage}
					</div>
				)}

				{successMessage && (
					<div className="p-3 bg-green-100 text-green-700 rounded-lg">
						{successMessage}
					</div>
				)}

				{/* Text Inputs */}
				{Object.entries(form).map(([key, value]) => {
					if (key === "mikrotikProfile") return null;

					return (
						<div key={key}>
							<label className="block mb-1 text-primary capitalize">
								{key.replace(/([A-Z])/g, " $1")}
							</label>
							<input
								type="text"
								name={key}
								value={value}
								onChange={handleChange}
								required
								autoComplete="off"
								className="w-full px-4 py-2 border rounded-lg"
							/>
						</div>
					);
				})}

				{/* Mikrotik Profile (OPTIONAL) */}
				<div>
					<label className="block mb-1 text-primary">
						Mikrotik Profile (Optional)
					</label>
					<select
						name="mikrotikProfile"
						value={form.mikrotikProfile}
						onChange={handleChange}
						disabled={profilesLoading}
						className="w-full px-4 py-2 border rounded-lg
							bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-primary))]
							focus:outline-none focus:ring-1 focus:ring-accent"
					>
						<option value="">None</option>
						{profiles.map((profile) => (
							<option key={profile} value={profile}>
								{profile}
							</option>
						))}
					</select>
				</div>

				<button
					type="submit"
					disabled={isPending || profilesLoading}
					className={`w-full px-4 py-2 rounded-lg text-white transition ${
						isPending || profilesLoading
							? "bg-gray-400 cursor-not-allowed"
							: "bg-primary hover:bg-primary/90"
					}`}
				>
					{isPending
						? "Creating plan..."
						: profilesLoading
						? "Loading profiles..."
						: "Create Plan"}
				</button>
			</form>
		</div>
	);
};

export default AdminCreateSubscription;
