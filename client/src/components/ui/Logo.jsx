import { logoDark } from "../../assets";

const Logo = ({ collapsed }) => {
	return (
		<div className="flex items-center gap-2">
			<img 
				src={logoDark} 
				alt="WiFiSpace Unlimited" 
				className={`transition-all ${collapsed ? "w-8" : "w-10"}`} 
			/>
			{!collapsed && (
				<span className="text-lg font-bold whitespace-nowrap">
					WiFiSpace Unlimited
				</span>
			)}
		</div>
	);
};

export default Logo;
