import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ROUTE } from "../../Routes/Route";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import SocialAuthButton from "../../components/ui/SocialAuthButton";
import { GoogleIcon } from "../../components/ui/GoogleIcon";
import { Mail, Lock } from "lucide-react";
import { useLogin, useGoogleAuth } from "../../hooks/useAuthHooks";

const Login = () => {
	const [form, setForm] = useState({ email: "", password: "" });
	const [error, setError] = useState(null);

	const { login: authLogin } = useAuth();
	const navigate = useNavigate();

	const loginMutation = useLogin();
	const googleMutation = useGoogleAuth();

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
		if (error) setError(null);
	};

	const validateForm = () => {
		if (!form.email || !form.password) {
			setError("Email and password are required.");
			return false;
		}
		if (!/\S+@\S+\.\S+/.test(form.email)) {
			setError("Invalid email format");
			return false;
		}
		return true;
	};

	//----------------------
	// Email/Password Login
	//----------------------
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		if (!validateForm()) return;

		loginMutation.mutate(form, {
			onSuccess: async () => {
				try {
					const user = await authLogin(form);

					// Redirect handled here once only
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

	//----------------------
	// Google Login
	//----------------------
	const handleGoogleLogin = () => {
		setError(null);

		googleMutation.mutate(null, {
			onSuccess: async (userData) => {
				try {
					await authLogin(userData);

					if (userData.role === "admin") navigate(ROUTE.adminDashboard);
					else navigate(ROUTE.dashboard);
				} catch (err) {
					setError(err?.message || "Google login failed");
				}
			},
			onError: (err) => {
				setError(err?.message || "Google login failed");
			}
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<h2 className="text-2xl font-semibold text-primary text-center">Login</h2>

			{error && <p className="text-red-500 text-center">{error}</p>}

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

			<Button type="submit" loading={loginMutation.isPending} className="w-full">
				Login
			</Button>

			<SocialAuthButton
				icon={<GoogleIcon size={20} />}
				label="Continue with Google"
				onClick={handleGoogleLogin}
				loading={googleMutation.isLoading}
				className="mt-2"
			/>

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
