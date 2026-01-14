import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ROUTE } from "../../Routes/Route";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Mail, Hash, Lock } from "lucide-react";

const LOGIN_TYPE_KEY = "lastLoginType";

const Login = () => {
	const [useCustomerId, setUseCustomerId] = useState(false);
	const [form, setForm] = useState({ identifier: "", password: "" });
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const { login: authLogin, isAuthenticated, user } = useAuth();
	const navigate = useNavigate();

	// Restore last login type from localStorage
	useEffect(() => {
		const saved = localStorage.getItem(LOGIN_TYPE_KEY);
		if (saved === "customerId") setUseCustomerId(true);
	}, []);

	// Redirect if already logged in
	useEffect(() => {
		if (isAuthenticated && user) {
			navigate(user.role === "admin" ? ROUTE.adminDashboard : ROUTE.dashboard);
		}
	}, [isAuthenticated, user, navigate]);

	// Toggle between email and customer ID login
	const toggleLoginType = () => {
		setUseCustomerId(prev => {
			const next = !prev;
			localStorage.setItem(LOGIN_TYPE_KEY, next ? "customerId" : "email");
			return next;
		});
		setForm({ identifier: "", password: "" });
		setError(null);
	};

	// Handle input changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value.trim() }));
		if (error) setError(null);
	};

	// Basic form validation
	const validateForm = () => {
		if (!form.identifier || !form.password) {
			setError("All fields are required.");
			return false;
		}
		if (!useCustomerId && !/\S+@\S+\.\S+/.test(form.identifier)) {
			setError("Please enter a valid email address.");
			return false;
		}
		return true;
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		if (!validateForm()) return;

		setLoading(true);
		try {
			await authLogin(form);
			// Navigation handled in AuthContext based on role
		} catch (err) {
			// Display user-friendly error
			const message = err?.response?.data?.message || err?.message || "Login failed";
			setError(message);
			console.error("Login error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<h2 className="text-2xl font-semibold text-primary text-center">Login</h2>

			{error && (
				<p role="alert" className="text-red-500 text-center">
					{error}
				</p>
			)}

			<Input
				label={useCustomerId ? "Customer ID" : "Email"}
				type="text"
				icon={useCustomerId ? <Hash size={18} /> : <Mail size={18} />}
				value={form.identifier}
				onChange={handleChange}
				placeholder={useCustomerId ? "Enter your customer ID" : "Enter your email"}
				name="identifier"
				required
			/>

			<Input
				label="Password"
				type="password"
				icon={<Lock size={18} />}
				value={form.password}
				onChange={handleChange}
				placeholder="Enter your password"
				name="password"
				required
			/>

			<p
				onClick={!loading ? toggleLoginType : undefined}
				className={`text-sm text-indigo-500 cursor-pointer text-right hover:underline ${
					loading ? "opacity-50 pointer-events-none" : ""
				}`}
			>
				{useCustomerId ? "Use email instead" : "Use customer ID instead"}
			</p>

			<Button type="submit" loading={loading} className="w-full">
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
