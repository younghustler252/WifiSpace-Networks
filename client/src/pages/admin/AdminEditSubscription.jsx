import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getAllPlans } from "../../services/subscriptionService";
import { useUpdateSubscription, useMikrotikProfiles } from "../../hooks/useAdmin";
import SubscriptionForm from "../../components/SubcriptionForm";
import BackButton from "../../components/ui/BackButton";

const AdminEditSubscription = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const { data: plans, isLoading: loadingPlans } = useQuery({
		queryKey: ["adminSubscriptions"],
		queryFn: getAllPlans,
	});

	const plan = plans?.find((p) => p._id === id);

	const { mutate: updatePlan, isLoading: isUpdating } = useUpdateSubscription();
	const { data: profilesData, isLoading: profilesLoading } = useMikrotikProfiles();
	const profiles = profilesData?.data?.profiles || [];

	const [form, setForm] = useState({
		planName: "",
		price: "",
		speedRate: "10",
		devicesAllowed: "",
		features: "",
		durationDays: "30",
		mikrotikProfile: "",
		description: "",
	});

	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	useEffect(() => {
		if (plan) {
			setForm({
				planName: plan.planName || "",
				price: plan.price || "",
				speedRate: plan.speedRate || "10",
				devicesAllowed: plan.devicesAllowed || "",
				features: plan.features ? plan.features.join(", ") : "",
				durationDays: plan.durationDays || "30",
				mikrotikProfile: plan.mikrotikProfile || "",
				description: plan.description || "",
			});
		}
	}, [plan]);

	if (loadingPlans || !plan) return <p className="text-center p-6">Loading...</p>;

	const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

	const handleSubmit = (e) => {
		e.preventDefault();
		setErrorMessage("");
		setSuccessMessage("");

		const payload = {
			...form,
			price: Number(form.price),
			speedRate: Number(form.speedRate),
			devicesAllowed: Number(form.devicesAllowed) || 1,
			durationDays: Number(form.durationDays),
			features: form.features ? form.features.split(",").map((f) => f.trim()) : [],
		};

		updatePlan(
			{ id, updates: payload },
			{
				onSuccess: () => {
					setSuccessMessage("Plan updated successfully ✅");
					setTimeout(() => navigate("/admin/subscriptions"), 1500);
				},
				onError: (err) => setErrorMessage(err?.message || "Failed to update plan"),
			}
		);
	};

	return (
		<SubscriptionForm
			form={form}
			onChange={handleChange}
			onSubmit={handleSubmit}
			isPending={isUpdating}
			profiles={profiles}
			profilesLoading={profilesLoading}
			errorMessage={errorMessage}
			successMessage={successMessage}
			formTitle="Edit Subscription Plan"
			backButton={<BackButton />}
		/>
	);
};

export default AdminEditSubscription;
