import React from "react";

const SocialAuthButton = ({
	icon,
	label,
	onClick,
	loading = false,
	className = "",
}) => {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={loading}
			className={`
				w-full flex items-center justify-center gap-2
				border border-surface bg-surface text-primary
				rounded-md py-2.5 transition-all
				hover:bg-primary/5 active:scale-[.98]
				disabled:opacity-50 disabled:cursor-not-allowed
				${className}
			`}
		>
			{loading ? (
				<div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
			) : (
				icon
			)}
			<span className="text-sm font-medium">{label}</span>
		</button>
	);
};

export default SocialAuthButton;
