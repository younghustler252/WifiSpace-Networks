import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateSubscription, useMikrotikProfiles } from "../../hooks/useAdmin";
import SubscriptionForm from "../../components/SubcriptionForm";
import BackButton from "../../components/ui/BackButton";

const AdminCreateSubscription = () => {
	const navigate = useNavigate();
	const { mutate: createPlan, isPending } = useCreateSubscription();
	const { data, isLoading } = useMikrotikProfiles();
	const profiles = data?.data?.profiles || [];

	const [form, setForm] = useState({
		planName: "",
		price: "",
		speedRate: "10",
		devicesAllowed: "",
		features: "",
		durationDays: "30",
		mikrotikProfile: "",
	});
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

	const handleSubmit = e => {
		e.preventDefault();
		setErrorMessage("");
		setSuccessMessage("");

		const payload = {
			planName: form.planName,
			price: Number(form.price),
			speedRate: Number(form.speedRate),
			devicesAllowed: Number(form.devicesAllowed) || 1,
			durationDays: Number(form.durationDays),
			features: form.features ? form.features.split(",").map(f => f.trim()) : [],
			mikrotikProfile: form.mikrotikProfile || null,
		};

		createPlan(payload, {
			onSuccess: () => {
				setSuccessMessage("Plan created successfully ✅");
				setForm({ planName: "", price: "", speedRate: "10", devicesAllowed: "", features: "", durationDays: "30", mikrotikProfile: "" });
				setTimeout(() => navigate("/admin/subscriptions"), 1500);
			},
			onError: err => setErrorMessage(err?.message || "Failed to create plan"),
		});
	};

	return (
		<SubscriptionForm
			form={form}
			onChange={handleChange}
			onSubmit={handleSubmit}
			isPending={isPending}
			profiles={profiles}
			profilesLoading={isLoading}
			errorMessage={errorMessage}
			successMessage={successMessage}
			formTitle="Create Subscription Plan"
			backButton={<BackButton />}
		/>
	);
};

export default AdminCreateSubscription;
