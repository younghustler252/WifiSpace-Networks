import { Menu, Bell } from "lucide-react"
import Avatar from "../components/ui/Avatar"
import { useAuth } from "../hooks/useAuth"

const Header = ({ onToggle }) => {
	const { user } = useAuth()

	return (
		<header className="h-14 flex items-center justify-between px-4 border-b border-surface bg-surface text-primary">

			{/* Left */}
			<div className="flex items-center gap-3">
				<button
					onClick={onToggle}
					aria-label="Toggle sidebar"
					className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
				>
					<Menu className="w-6 h-6 transition-colors hover:text-primary" />
				</button>
			</div>

			{/* Right */}
			<div className="flex items-center gap-6">

				{/* Notifications */}
				<button
					className="relative transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"
					aria-label="Notifications"
				>
					<Bell className="w-5 h-5" />
				</button>

				{/* Profile */}
				<button
					className="flex items-center gap-2 transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"
					aria-label="Profile"
				>
					<Avatar
						src={user?.profilePicture}
						firstName={user?.firstName}
						lastName={user?.lastName}
						size={32}
					/>

					<span className="hidden sm:block font-medium">
						{user?.firstName || "Profile"}
					</span>
				</button>
			</div>

		</header>
	)
}

export default Header
