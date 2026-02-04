import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateSubscription, useMikrotikProfiles } from "../../hooks/useAdmin";
import SubscriptionForm from "../../components/SubcriptionForm";
import BackButton from "../../components/ui/BackButton";

const AdminCreateSubscription = () => {
	const navigate = useNavigate();

	// ✅ Use React Query mutation
	const { mutate: createPlan, status, error, isError, isSuccess, isPending, data } = useCreateSubscription();

	// ✅ Load Mikrotik profiles
	const { data: profileData, isLoading: profilesLoading } = useMikrotikProfiles();
	const profiles = profileData?.data?.profiles || [];

	// Form state
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

	// Handle input change
	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	// Handle form submit
	const handleSubmit = (e) => {
		e.preventDefault();
		setErrorMessage("");
		setSuccessMessage("");

		const payload = {
			planName: form.planName,
			price: Number(form.price),
			speedRate: Number(form.speedRate),
			devicesAllowed: Number(form.devicesAllowed) || 1,
			durationDays: Number(form.durationDays),
			features: form.features ? form.features.split(",").map((f) => f.trim()) : [],
			mikrotikProfile: form.mikrotikProfile || null,
		};

		// ✅ Call mutation
		createPlan(payload, {
			onSuccess: (data) => {
				if(isSuccess) {
					console.log("plan created successful")
				}
				setSuccessMessage(data?.message || "Plan created successfully ✅");
				setForm({
					planName: "",
					price: "",
					speedRate: "10",
					devicesAllowed: "",
					features: "",
					durationDays: "30",
					mikrotikProfile: "",
				});
				// Navigate after short delay
				setTimeout(() => navigate("/admin/subscriptions"), 1500);
			},
			onError: (err) => {
				setErrorMessage(err?.message || "Failed to create plan");
			},
		});
	};

	return (
		<SubscriptionForm
			form={form}
			onChange={handleChange}
			onSubmit={handleSubmit}
			isPending={isPending}               // React Query drives spinner
			profiles={profiles}
			profilesLoading={profilesLoading}
			errorMessage={errorMessage || (isError ? error?.message : "")}  // show React Query error if exists
			successMessage={successMessage}
			formTitle="Create Subscription Plan"
			backButton={<BackButton />}
		/>
	);
};

export default AdminCreateSubscription;
