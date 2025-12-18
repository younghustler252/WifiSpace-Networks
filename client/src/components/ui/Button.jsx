const Button = ({ children, loading = false, disabled = false, onClick, type = "button" }) => {
	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled || loading}
			className={`w-full py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex justify-center items-center`}
		>
			{loading && (
				<svg
					className="animate-spin h-5 w-5 mr-2 text-white"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					></circle>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
					></path>
				</svg>
			)}
			{children}
		</button>
	);
};

export default Button;
