
import { CreditCard, Calendar } from "lucide-react";
import TransactionStatusBadge from "./TransactionStatusBadge";

const TransactionItem = ({ transaction }) => {
    return (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-surface bg-card hover:bg-surface-hover transition">
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-md bg-surface border border-surface">
                    <CreditCard size={16} className="text-accent" />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                        {transaction.planName || "Subscription payment"}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-secondary">
                        <Calendar size={12} />
                        <span>
                            {new Date(transaction.paymentDate).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="capitalize">
                            {transaction.method}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4 shrink-0">
                <p className="text-sm font-semibold text-primary">
                    ₦{transaction.amount.toLocaleString()}
                </p>

                <TransactionStatusBadge status={transaction.status} />
            </div>
        </div>
    );
};

export default TransactionItem;
