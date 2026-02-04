const PageHeader = ({ title, actionLabel, onAction }) => {
	return (
		<div className="flex justify-between items-center flex-wrap gap-3">
			<h1 className="text-2xl font-bold text-primary">
				{title}
			</h1>

			{actionLabel && (
				<button
					onClick={onAction}
					className="btn btn-primary"
				>
					{actionLabel}
				</button>
			)}
		</div>
	);
};

export default PageHeader;
