import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({ label, type = "text", icon, value, onChange, placeholder, name }) => {
	const [showPassword, setShowPassword] = useState(false);

	const isPassword = type === "password";
	const inputType = isPassword && showPassword ? "text" : type;

	return (
		<div className="mb-4">
			<label className="flex items-center text-primary mb-1" htmlFor={name}>
				{icon && <span className="mr-2">{icon}</span>}
				{label}
			</label>
			<div className="relative">
				<input
					type={inputType}
					id={name}
					name={name}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					className="w-full border border-surface rounded-md px-3 py-2 bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
				{isPassword && (
					<span
						className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
						onClick={() => setShowPassword(!showPassword)}
					>
						{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
					</span>
				)}
			</div>
		</div>
	);
};

export default Input;
