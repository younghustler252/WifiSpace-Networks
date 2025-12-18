import { Outlet } from "react-router-dom";
import Card from "../components/ui/Card"; // reusable Card component
import { logo } from "../assets";
export default function AuthLayout() {
	return (
		<div className="min-h-screen w-full grid lg:grid-cols-2 transition-colors duration-300 bg-surface text-primary">

			{/* Left Section */}
			<div className="hidden lg:flex items-center justify-center">
				<div className="max-w-md text-center px-8">
					<h1 className="text-4xl font-bold">
						Welcome
					</h1>
					<p className="mt-4 text-primary/70">
						Please sign in to continue.
					</p>

					
				</div>
			</div>

			{/* Right Section */}
			<div className="flex items-center justify-center px-6">
				<div className="w-full max-w-md space-y-6">

					{/* Card handles bg, border, shadow, and dark mode automatically */}
					<Card>
						<Outlet />
					</Card>

				</div>
			</div>

		</div>
	);
}
