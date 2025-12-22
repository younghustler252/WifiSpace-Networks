const FILTERS = ["all", "successful", "pending", "failed"];

const TransactionFilters = ({ active, onChange }) => {
    return (
        <div className="flex gap-2 flex-wrap">
            {FILTERS.map(status => (
                <button
                    key={status}
                    onClick={() => onChange(status)}
                    className={`px-3 py-1.5 rounded-md text-sm capitalize border transition
						${active === status
                            ? "bg-indigo-500 text-white border-indigo-500"
                            : "bg-surface text-secondary border-surface hover:bg-surface-hover"
                        }`}
                >
                    {status}
                </button>
            ))}
        </div>
    );
};

export default TransactionFilters;
