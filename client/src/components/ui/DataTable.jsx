const DataTable = ({ columns, data, renderRow, renderCell, emptyText = "No data found." }) => {
    if (!data || data.length === 0) {
        return <p className="p-4 text-center text-muted">{emptyText}</p>;
    }

    return (
        <div className="w-full overflow-x-auto">
            {/* Desktop Table */}
            <table className="hidden md:table min-w-full border-collapse bg-surface rounded-xl shadow-sm border border-surface">
                <thead>
                    <tr className="border-b border-surface bg-surface-hover text-primary">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wide whitespace-nowrap"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) =>
                        renderRow
                            ? renderRow(row, index)
                            : (
                                <tr key={index} className="border-b border-surface hover:bg-surface-hover transition-colors">
                                    {columns.map((col) => (
                                        <td key={col.key} className="py-2 px-4 text-sm text-primary">
                                            {row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            )
                    )}
                </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-4 md:hidden">
                {data.map((row, index) => (
                    <div
                        key={index}
                        className="bg-surface border border-surface rounded-xl shadow-sm p-4 flex flex-col gap-2 hover:bg-surface-hover transition-colors"
                    >
                        {columns.map((col) => (
                            <div key={col.key} className="flex justify-between">
                                <span className="text-muted font-medium text-sm">{col.label}</span>
                                <span className="text-primary font-medium text-sm">
                                    {renderCell ? renderCell(row, index, col.key) : row[col.key]}
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
