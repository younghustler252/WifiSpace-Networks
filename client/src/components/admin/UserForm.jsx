import { useState, useEffect, useRef } from "react";
import Input from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Loader";
import BackButton from "../../components/ui/BackButton";

const UserForm = ({ initialValues, onSubmit, submitText = "Submit" }) => {
	const submitCountRef = useRef(0);
	const [formData, setFormData] = useState(initialValues);
	const [error, setError] = useState(null);
	const [isPending, setIsPending] = useState(false);

	// Scroll to top on error
	useEffect(() => {
		if (error) window.scrollTo({ top: 0, behavior: "smooth" });
	}, [error]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		submitCountRef.current += 1;
		setError(null);
		setIsPending(true);

		onSubmit(formData, {
			onError: (err) => {
				console.error("❌ Form error:", err);
				setError(
					err?.response?.data?.message || err?.message || "Something went wrong"
				);
				setIsPending(false);
			},
			onSuccess: () => setIsPending(false),
		});
	};

	return (
		<div className="max-w-3xl mx-auto p-6 space-y-6 card shadow-card rounded-xl">
			<BackButton label="Back to Users" />

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Error message */}
				{error && (
					<div className="text-danger text-center font-medium animate-fade-in">
						{error}
					</div>
				)}

				<h1 className="text-3xl font-bold text-primary">{submitText}</h1>

				{/* Name Fields */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<Input
						label="First Name"
						name="firstName"
						value={formData.firstName}
						onChange={handleChange}
					/>
					<Input
						label="Last Name"
						name="lastName"
						value={formData.lastName}
						onChange={handleChange}
					/>
				</div>

				{/* Email & Phone */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<Input
						label="Email"
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
					/>
					<Input
						label="Phone"
						name="phone"
						value={formData.phone}
						onChange={handleChange}
					/>
				</div>

				{/* WSN ID & NIN */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<Input
						label="WSN ID"
						name="wsnId"
						value={formData.wsnId}
						onChange={handleChange}
						placeholder="e.g. WSN001"
					/>
					<Input
						label="NIN"
						name="nin"
						value={formData.nin}
						onChange={handleChange}
					/>
				</div>

				{/* Role & Address */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<div className="flex flex-col">
						<label className="text-primary mb-1 font-medium">Role</label>
						<select
							name="role"
							value={formData.role}
							onChange={handleChange}
							className="
								border border-surface
								bg-card text-primary
								rounded-md px-3 py-2
								focus:outline-none focus-ring
								w-full
							"
						>
							<option value="user">User</option>
							<option value="admin">Admin</option>
						</select>
					</div>

					<Input
						label="Address"
						name="address"
						value={formData.address}
						onChange={handleChange}
					/>
				</div>

				{/* Password */}
				<Input
					label="Password"
					type="password"
					name="password"
					value={formData.password}
					onChange={handleChange}
				/>

				{/* Submit Button */}
				<button
					type="submit"
					disabled={isPending}
					className="btn btn-primary w-full sm:w-auto px-8 py-3 rounded-full flex justify-center items-center gap-2"
				>
					{isPending ? <Spinner /> : submitText}
				</button>
			</form>
		</div>
	);
};

export default UserForm;
