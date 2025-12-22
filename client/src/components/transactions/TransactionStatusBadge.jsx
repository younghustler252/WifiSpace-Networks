import { CheckCircle, Clock, XCircle } from "lucide-react";

const TransactionStatusBadge = ({ status }) => {
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

export default TransactionStatusBadge;
