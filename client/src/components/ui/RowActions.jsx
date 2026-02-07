import { useState } from "react";

const RowActions = ({ actions }) => {
	const [open, setOpen] = useState(false);

	return (
		<div className="relative">
			<button
				onClick={() => setOpen((v) => !v)}
				aria-label="Row actions"
				className="
					h-8 w-8 flex items-center justify-center
					rounded-md
					text-secondary
					hover:bg-hover hover:text-primary
					focus-ring
					
				"
			>
				⋮
			</button>

			{open && (
				<div
					className="
						absolute right-0 mt-2 w-44 z-20
						card p-1
						flex flex-col
					"
					onMouseLeave={() => setOpen(false)}
				>
					{actions.map((action) => {
						const isDisabled = action.disabled;
						const isDanger = action.variant === "danger";

						return (
							<button
								key={action.label}
								onClick={action.onClick}
								disabled={isDisabled}
								className={`
									w-full text-left px-3 py-2 rounded-md text-sm
									transition-colors
									${isDisabled
										? "text-muted cursor-not-allowed"
										: "hover:bg-hover"
									}
									${isDanger ? "text-danger" : "text-primary"}
								`}
							>
								<span className="block">
									{action.label}
								</span>

								{action.hint && (
									<span className="block text-xs text-muted mt-0.5">
										{action.hint}
									</span>
								)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default RowActions;
