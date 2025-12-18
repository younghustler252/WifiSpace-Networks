import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ROUTE } from "../../Routes/Route";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import { Mail, Lock, User } from "lucide-react";
import { useRegister } from "../../hooks/useAuthHooks"; // new hook

const Register = () => {
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: ""
	});

	const [error, setError] = useState(null);

	const navigate = useNavigate();
	const { login: authLogin, isAuthenticated, user } = useAuth();

	const registerMutation = useRegister();

	useEffect(() => {
		if (isAuthenticated && user) {
			if (user.role === "admin") {
				navigate(ROUTE.adminDashboard);
			} else {
				navigate(ROUTE.dashboard);
			}
		}
	}, [isAuthenticated, user, navigate]);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
		if (error) setError(null);
	};

	const validateForm = () => {
		const { name, email, password, confirmPassword } = form;

		if (!name || !email || !password || !confirmPassword) {
			setError("All fields are required.");
			return false;
		}

		if (!/\S+@\S+\.\S+/.test(email)) {
			setError("Invalid email format.");
			return false;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters long.");
			return false;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return false;
		}

		return true;
	};

	//----------------------
	// Registration Submit
	//----------------------
	const handleSubmit = (e) => {
		e.preventDefault();
		setError(null);

		if (!validateForm()) return;

		registerMutation.mutate(form, {
			onSuccess: (userData) => {
				// auto login after registration
				authLogin(userData);

			},
			onError: (err) => {
				setError(err?.message || "Registration failed");
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<h2 className="text-2xl font-semibold text-primary text-center">
				Create Account
			</h2>

			{error && <p className="text-red-500 text-center">{error}</p>}

			<Input
				label="Full Name"
				type="text"
				icon={<User size={18} />}
				value={form.name}
				onChange={handleChange}
				placeholder="Enter your full name"
				name="name"
			/>

			<Input
				label="Email"
				type="email"
				icon={<Mail size={18} />}
				value={form.email}
				onChange={handleChange}
				placeholder="Enter your email"
				name="email"
			/>

			<Input
				label="Password"
				type="password"
				icon={<Lock size={18} />}
				value={form.password}
				onChange={handleChange}
				placeholder="Enter your password"
				name="password"
			/>

			<Input
				label="Confirm Password"
				type="password"
				icon={<Lock size={18} />}
				value={form.confirmPassword}
				onChange={handleChange}
				placeholder="Re-enter your password"
				name="confirmPassword"
			/>

			<Button type="submit" loading={registerMutation.isLoading} className="w-full">
				Create Account
			</Button>

			<p className="text-sm text-center text-primary/70">
				Already have an account?{" "}
				<Link to={ROUTE.login} className="text-indigo-500 hover:underline">
					Login
				</Link>
			</p>
		</form>
	);
};

export default Register;
