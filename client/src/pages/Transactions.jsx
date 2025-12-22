import { CreditCard } from "lucide-react";
import { useState } from "react";
import { Spinner } from "../components/ui/Loader";
import TransactionList from "../components/transactions/TransactionList";
import TransactionFilters from "../components/transactions/TransactionFilters";
import { useMyPayments } from "../hooks/usePayment";

const Transactions = () => {
    const { data, isLoading, isError, error } = useMyPayments();
    const [filter, setFilter] = useState("all");

    if (isLoading) {
        return <Spinner message="Loading transactions..." />;
    }

    if (isError) {
        return (
            <div className="p-6 text-center text-red-500">
                {error?.message || "Failed to load transactions"}
            </div>
        );
    }

    const transactions = data?.payments || [];
    console.log('payments:', transactions)

    const filteredTransactions =
        filter === "all"
            ? transactions
            : transactions.filter(tx => tx.status === filter);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-primary">
                    Transactions
                </h1>
                <p className="text-sm text-secondary">
                    View all your payment history
                </p>
            </div>

            {/* Filters */}
            <TransactionFilters
                active={filter}
                onChange={setFilter}
            />

            {/* Content */}
            {filteredTransactions.length > 0 ? (
                <TransactionList transactions={filteredTransactions} />
            ) : (
                <div className="py-16 text-center text-secondary bg-surface border border-surface rounded-xl">
                    <CreditCard className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm">
                        No transactions found
                    </p>
                </div>
            )}
        </div>
    );
};

export default Transactions;
