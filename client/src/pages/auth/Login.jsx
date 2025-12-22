import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ROUTE } from "../../Routes/Route";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Mail, Hash, Lock } from "lucide-react";
import { useLogin } from "../../hooks/useAuthHooks";

const LOGIN_TYPE_KEY = "lastLoginType";

const Login = () => {
	const [useCustomerId, setUseCustomerId] = useState(false);
	const [form, setForm] = useState({ identifier: "", password: "" });
	const [error, setError] = useState(null);

	const { login: authLogin } = useAuth();
	const navigate = useNavigate();
	const loginMutation = useLogin();

	// ----------------------
	// Restore last login type
	// ----------------------
	useEffect(() => {
		const saved = localStorage.getItem(LOGIN_TYPE_KEY);
		if (saved === "customerId") setUseCustomerId(true);
	}, []);

	const toggleLoginType = () => {
		const next = !useCustomerId;
		setUseCustomerId(next);
		localStorage.setItem(LOGIN_TYPE_KEY, next ? "customerId" : "email");
		setForm({ identifier: "", password: "" });
		setError(null);
	};

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
		if (error) setError(null);
	};

	const validateForm = () => {
		if (!form.identifier || !form.password) {
			setError("All fields are required.");
			return false;
		}

		// Only validate email format if email mode
		if (!useCustomerId && !/\S+@\S+\.\S+/.test(form.identifier)) {
			setError("Please enter a valid email address.");
			return false;
		}

		return true;
	};

	// ----------------------
	// Login
	// ----------------------
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		if (!validateForm()) return;

		loginMutation.mutate(form, {
			onSuccess: async () => {
				try {
					const user = await authLogin(form);
					if (user.role === "admin") navigate(ROUTE.adminDashboard);
					else navigate(ROUTE.dashboard);
				} catch (err) {
					setError(err?.message || "Login failed");
				}
			},
			onError: (err) => {
				setError(err?.message || "Login failed");
			}
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<h2 className="text-2xl font-semibold text-primary text-center">
				Login
			</h2>

			{error && <p className="text-red-500 text-center">{error}</p>}

			<Input
				label={useCustomerId ? "Customer ID" : "Email"}
				type="text"
				icon={useCustomerId ? <Hash size={18} /> : <Mail size={18} />}
				value={form.identifier}
				onChange={handleChange}
				placeholder={
					useCustomerId
						? "Enter your customer ID"
						: "Enter your email"
				}
				name="identifier"
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

			{/* Subtle switch */}
			<p
				onClick={toggleLoginType}
				className="text-sm text-indigo-500 cursor-pointer text-right hover:underline"
			>
				{useCustomerId ? "Use email instead" : "Use customer ID instead"}
			</p>
			<Button type="submit" loading={loginMutation.isPending} className="w-full">
				Login
			</Button>

			<p className="text-sm text-center text-primary/70">
				Don't have an account?{" "}
				<Link to={ROUTE.register} className="text-indigo-500 hover:underline">
					Create Account
				</Link>
			</p>
		</form>
	);
};

export default Login;
