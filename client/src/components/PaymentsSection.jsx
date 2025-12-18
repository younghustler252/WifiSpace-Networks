import {
    CreditCard,
    Calendar,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";

/* ---------------- STATUS BADGE ---------------- */

const StatusBadge = ({ status }) => {
    if (status === "successful") {
        return (
            <span className="badge-success inline-flex items-center gap-1">
                <CheckCircle size={12} />
                Successful
            </span>
        );
    }

    if (status === "failed") {
        return (
            <span className="badge-danger inline-flex items-center gap-1">
                <XCircle size={12} />
                Failed
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-surface text-secondary border border-surface">
            <Clock size={12} />
            Pending
        </span>
    );
};

/* ---------------- PAYMENT ROW ---------------- */

const PaymentItem = ({ payment }) => {
    return (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-surface bg-card hover:bg-surface-hover transition">

            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-md bg-surface border border-surface">
                    <CreditCard size={16} className="text-accent" />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                        {payment.planName || "Subscription payment"}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-secondary">
                        <Calendar size={12} />
                        <span>
                            {new Date(payment.paymentDate).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="capitalize">
                            {payment.method}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4 shrink-0">
                <p className="text-sm font-semibold text-primary">
                    ₦{payment.amount.toLocaleString()}
                </p>

                <StatusBadge status={payment.status} />
            </div>
        </div>
    );
};

/* ---------------- MAIN SECTION ---------------- */

const PaymentsSection = ({ payments = [] }) => {
    const sortedPayments = [...payments].sort(
        (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
    );

    return (
        <div className="bg-surface border border-surface rounded-xl shadow-card">
            <div className="px-5 py-4 border-b border-surface">
                <h2 className="text-base font-semibold text-primary">
                    Recent payments
                </h2>
                <p className="text-xs text-secondary">
                    Your latest transactions
                </p>
            </div>

            {sortedPayments.length > 0 ? (
                <div className="p-3 space-y-2">
                    {sortedPayments.slice(0, 5).map(payment => (
                        <PaymentItem
                            key={payment._id}
                            payment={payment}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-10 text-center text-secondary">
                    <CreditCard className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No recent payments</p>
                </div>
            )}
        </div>
    );
};

export default PaymentsSection;
