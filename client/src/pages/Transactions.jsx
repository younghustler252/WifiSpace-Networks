import { CreditCard } from "lucide-react";
import { Spinner } from "../components/ui/Loader";
import PaymentsSection from "../components/PaymentsSection";
import { useMyPayments } from "../hooks/usePayment";

const Transactions = () => {
    const {
        data,
        isLoading,
        isError,
        error,
    } = useMyPayments();

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

    const payments = data?.payments || [];
    console.log("payments, payments", payments)

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

            {/* Content */}
            {payments.length > 0 ? (
                <PaymentsSection payments={payments} />
            ) : (
                <div className="py-16 text-center text-secondary bg-surface border border-surface rounded-xl">
                    <CreditCard className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm">
                        You haven’t made any payments yet
                    </p>
                </div>
            )}
        </div>
    );
};

export default Transactions;
