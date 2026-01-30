import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateUser } from "../../hooks/useAdmin";
import Input from "../../components/ui/Input";
import BackButton from "../../components/ui/BackButton";
import { Spinner } from "../../components/ui/Loader";

const CreateUser = () => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		phone: "",
		wsnId: "",
		nin: "",
		role: "user",
		address: "",
	});
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { mutate: createUser } = useCreateUser();

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name === "wsnId") {
			setFormData((prev) => ({
				...prev,
				[name]: value.startsWith("WSN-") ? value : `WSN-${value}`,
			}));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);
		setLoading(true);

		createUser(formData, {
			onSuccess: () => {
				setSuccess("User created successfully ✅");
				setTimeout(() => navigate("/admin/users"), 1200);
			},
			onError: (err) => {
				const msg =
					err?.response?.data?.message ||
					err?.message ||
					"Failed to create user";
				setError(msg);
			},
			onSettled: () => setLoading(false),
		});
	};

	return (
		<div className="max-w-3xl mx-auto p-6 space-y-6 bg-card shadow-card rounded-lg">
			<BackButton label="Back to Users" />

			<h1 className="text-3xl font-bold text-primary mb-6">
				Create New User
			</h1>

			{error && (
				<div className="text-danger text-center mb-4">{error}</div>
			)}
			{success && (
				<div className="text-green-600 text-center mb-4">{success}</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Name */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<Input
						label="First Name"
						name="firstName"
						value={formData.firstName}
						onChange={handleChange}
						placeholder="Enter first name"
					/>
					<Input
						label="Last Name"
						name="lastName"
						value={formData.lastName}
						onChange={handleChange}
						placeholder="Enter last name"
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
						placeholder="Enter email"
					/>
					<Input
						label="Phone"
						name="phone"
						value={formData.phone}
						onChange={handleChange}
						placeholder="Enter phone"
					/>
				</div>

				{/* WSN & NIN */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<Input
						label="WSN ID"
						name="wsnId"
						value={formData.wsnId}
						onChange={handleChange}
						placeholder="Enter WSN ID (e.g., 12345)"
					/>
					<Input
						label="NIN"
						name="nin"
						value={formData.nin}
						onChange={handleChange}
						placeholder="Enter NIN"
					/>
				</div>

				{/* Role & Address */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<div>
						<label htmlFor="role" className="text-primary mb-1">
							Role
						</label>
						<select
							id="role"
							name="role"
							value={formData.role}
							onChange={handleChange}
							className="w-full border border-surface rounded-md px-3 py-2 bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
						placeholder="Enter address"
					/>
				</div>

				{/* Password */}
				<Input
					label="Password"
					type="password"
					name="password"
					value={formData.password}
					onChange={handleChange}
					placeholder="Enter password"
				/>

				{/* Submit */}
				<div className="flex justify-end">
					<button
						type="submit"
						className="btn btn-primary px-8 py-3 rounded-full text-lg w-full sm:w-auto"
						disabled={loading}
					>
						{loading ? <Spinner /> : "Create User"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default CreateUser;
