import { Outlet } from "react-router-dom";
import Card from "../components/ui/Card"; // reusable Card component
import logoDark from "../../public/wifispaceDark.png";

export default function AuthLayout() {
	return (
		<div className="min-h-screen w-full grid lg:grid-cols-2 transition-colors duration-300 bg-surface text-primary">

			{/* Left Section: Branding + Professional Message */}
			<div className="hidden lg:flex items-center justify-center bg-primary/5">
				<div className="max-w-md text-center px-8">
					{/* Logo */}
					<img src={logoDark} alt="Company Logo" className="mx-auto mb-6 w-32 h-auto" />

					{/* Professional Headline */}
					<h1 className="text-4xl font-bold text-primary">
						Manage Your Account
					</h1>

					{/* Tagline / Description */}
					<p className="mt-4 text-primary/70 text-lg">
						Log in to access your subscriptions, reports, and settings.
					</p>
				</div>
			</div>

			{/* Right Section: Authentication Form */}
			<div className="flex items-center justify-center px-6">
				<div className="w-full max-w-md space-y-6">

					<Card>
						<Outlet />
					</Card>

				</div>
			</div>

		</div>
	);
}
