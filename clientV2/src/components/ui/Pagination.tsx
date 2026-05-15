"use client";

interface PaginationProps {
	page: number;
	totalPages: number;
	limit: number;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

export default function Pagination({
	page,
	totalPages,
	limit,
	onPageChange,
	onLimitChange,
}: PaginationProps) {
	const limits = [10, 20, 50, 100];

	const handlePrev = () => {
		if (page > 1) onPageChange(page - 1);
	};

	const handleNext = () => {
		if (page < totalPages) onPageChange(page + 1);
	};

	return (
		<div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">

			{/* ================= LIMIT SELECTOR ================= */}
			<div className="flex items-center gap-2 text-sm text-muted-foreground">

				<span>Show</span>

				<select
					className="ui-input w-auto h-9 px-2"
					value={limit}
					onChange={(e) => {
						const newLimit = Number(e.target.value);
						onLimitChange(newLimit);
						onPageChange(1); // reset page on limit change
					}}
				>
					{limits.map((l) => (
						<option
							key={l}
							value={l}
							disabled={l > limit && page === 1 && totalPages === 1}
						>
							{l}
						</option>
					))}
				</select>

				<span>entries</span>

			</div>

			{/* ================= NAV CONTROLS ================= */}
			<div className="flex items-center gap-2">

				<button
					className="ui-button-outline ui-button-small disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={page <= 1}
					onClick={handlePrev}
				>
					Prev
				</button>

				{/* PAGE INDICATOR */}
				<div className="text-sm font-medium px-2">
					<span className="text-foreground">{page}</span>
					<span className="text-muted-foreground">
						{" "} / {totalPages}
					</span>
				</div>

				<button
					className="ui-button-outline ui-button-small disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={page >= totalPages}
					onClick={handleNext}
				>
					Next
				</button>

			</div>

		</div>
	);
}