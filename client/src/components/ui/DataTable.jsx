import React from "react";

const DataTable = ({
	columns,
	data,
	renderRow,
	renderCell,
	onRowClick, // ✅ new prop
	emptyText = "No data found.",
}) => {
	if (!data || data.length === 0) {
		return (
			<div className="card text-center text-muted py-8">
				{emptyText}
			</div>
		);
	}

	return (
		<div className="w-full">

			{/* ================= DESKTOP TABLE ================= */}
			<div className="hidden md:block card overflow-hidden p-0">
				<div className="overflow-x-auto">
					<table className="min-w-full border-collapse">
						<thead>
							<tr className="bg-hover text-secondary">
								{columns.map((col) => (
									<th
										key={col.key}
										className="
											px-4 py-3
											text-left text-xs font-semibold
											uppercase tracking-wide
											whitespace-nowrap
										"
									>
										{col.label}
									</th>
								))}
							</tr>
						</thead>

						<tbody>
							{data.map((row, index) =>
								renderRow ? (
									renderRow(row, index)
								) : (
									<tr
										key={index}
										className="
											border-t border-surface
											hover:bg-hover
											transition-colors
											cursor-pointer
										"
										onClick={() => onRowClick && onRowClick(row)}
									>
										{columns.map((col) => (
											<td
												key={col.key}
												className="
													px-4 py-3
													text-sm text-primary
													whitespace-nowrap
												"
												onClick={(e) => {
													// prevent click propagation from action buttons
													if (col.key === "actions") e.stopPropagation();
												}}
											>
												{renderCell
													? renderCell(row, index, col.key)
													: row[col.key]}
											</td>
										))}
									</tr>
								)
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* ================= MOBILE CARDS ================= */}
			<div className="md:hidden flex flex-col gap-3">
				{data.map((row, index) => (
					<div
						key={index}
						className="card card-hover flex flex-col gap-3 cursor-pointer"
						onClick={() => onRowClick && onRowClick(row)}
					>
						{columns.map((col) => (
							<div
								key={col.key}
								className="flex items-start justify-between gap-4"
								onClick={(e) => {
									// stop propagation for action buttons inside mobile card
									if (col.key === "actions") e.stopPropagation();
								}}
							>
								<span className="text-xs text-muted font-medium">
									{col.label}
								</span>

								<span className="text-sm text-primary font-medium text-right">
									{renderCell
										? renderCell(row, index, col.key)
										: row[col.key]}
								</span>
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
};

export default DataTable;
