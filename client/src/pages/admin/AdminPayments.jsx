import { useState, useRef, useEffect } from "react";
import {
    useAllPayments,
    useSinglePayment,
    useActivatePayment,
    usePaymentAnalytics
} from "../../hooks/useAdminPayments";
import { Spinner } from "../../components/ui/Loader";
import toast from "react-hot-toast";
import { X, Filter, Eye, Check } from "lucide-react";

/* ---------------- Modal Component ---------------- */
const Modal = ({ open, onClose, children, closeOnOutsideClick = false }) => {
    const modalRef = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [closeOnOutsideClick, onClose]);

    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
                ref={modalRef}
                className="bg-surface dark:bg-gray-900 rounded-xl p-6 w-full max-w-xl relative shadow-card"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted hover:text-primary"
                >
                    <X size={20} />
                </button>
                {children}
            </div>
        </div>
    );
};

/* ---------------- Status Badge Component ---------------- */
const StatusBadge = ({ status }) => {
    const statusMap = {
        successful: "bg-green-100 text-green-700",
        pending: "bg-yellow-100 text-yellow-700",
        failed: "bg-red-100 text-red-700",
        expired: "bg-gray-100 text-gray-700",
        fout: "bg-purple-100 text-purple-700"
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[status] || "bg-gray-100 text-gray-700"}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

/* ---------------- Page ---------------- */
const AdminPayments = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(20);

    const [filters, setFilters] = useState({
        wsnId: "",
        planName: "",
        status: "",
        startDate: "",
        endDate: ""
    });

    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    const { data: paymentsData, isLoading: loadingPayments } =
        useAllPayments(filters, page, limit);
    const { data: paymentDetails } =
        useSinglePayment(selectedTransaction?.transactionId || null);
    const activatePayment = useActivatePayment();
    const { data: analytics } = usePaymentAnalytics();

    const openPaymentModal = (transaction) => {
        setSelectedTransaction(transaction);
        setModalOpen(true);
    };

    const handleActivate = async () => {
        if (!selectedTransaction) return;
        try {
            await activatePayment.mutateAsync(selectedTransaction.transactionId);
            toast.success("Payment activated successfully");
            setModalOpen(false);
        } catch {
            toast.error("Failed to activate payment");
        }
    };

    const resetFilters = () => {
        setFilters({ wsnId: "", planName: "", status: "", startDate: "", endDate: "" });
        setPage(1);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold text-primary">Admin Payments</h1>
                <button
                    onClick={() => setFilterModalOpen(true)}
                    className="md:hidden p-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                >
                    <Filter size={20} />
                </button>
            </div>

            {/* Analytics Cards */}
            {analytics && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl shadow-md bg-gradient-to-r from-green-100 to-green-50 transform hover:scale-105 transition">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-xl font-bold">₦{analytics.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl shadow-md bg-gradient-to-r from-blue-100 to-blue-50 transform hover:scale-105 transition">
                        <p className="text-sm text-gray-600">Total Payments</p>
                        <p className="text-xl font-bold">{analytics.totalPayments}</p>
                    </div>
                    <div className="p-4 rounded-xl shadow-md bg-gradient-to-r from-purple-100 to-purple-50 transform hover:scale-105 transition">
                        <p className="text-sm text-gray-600">Plans Revenue</p>
                        <ul className="text-sm mt-2 space-y-1">
                            {analytics.revenuePerPlan.map((plan) => (
                                <li key={plan.planName}>
                                    {plan.planName}: ₦{plan.totalRevenue.toLocaleString()} ({plan.count})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Filters Desktop */}
            <div className="hidden md:block bg-card p-4 rounded-xl shadow-card space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input
                        type="text"
                        placeholder="WSN ID"
                        value={filters.wsnId}
                        onChange={(e) => setFilters({ ...filters, wsnId: e.target.value })}
                        className="input"
                    />
                    <input
                        type="text"
                        placeholder="Plan Name"
                        value={filters.planName}
                        onChange={(e) => setFilters({ ...filters, planName: e.target.value })}
                        className="input"
                    />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="input"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="successful">Successful</option>
                        <option value="failed">Failed</option>
                        <option value="expired">Expired</option>
                        <option value="fout">Fout</option>
                    </select>
                    <div>
                        <label className="text-sm text-muted">From</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-muted">To</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="input"
                        />
                    </div>
                </div>

                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => setPage(1)}
                        className="border border-primary text-primary rounded px-3 py-1 hover:bg-primary/10 transition"
                    >
                        Apply
                    </button>
                    <button
                        onClick={resetFilters}
                        className="border border-red-500 text-red-500 rounded px-3 py-1 hover:bg-red-500/10 transition"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Table */}
            {loadingPayments ? (
                <Spinner message="Loading payments..." />
            ) : paymentsData?.payments?.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-surface">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800">
                                <th className="p-2 border">Transaction ID</th>
                                <th className="p-2 border">User</th>
                                <th className="p-2 border">Plan</th>
                                <th className="p-2 border">Amount</th>
                                <th className="p-2 border">Status</th>
                                <th className="p-2 border">Created At</th>
                                <th className="p-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentsData.payments.map((p) => (
                                <tr key={p.transactionId} className="hover:bg-surface-hover transition-colors relative group">
                                    <td className="p-2 border">{p.transactionId}</td>
                                    <td className="p-2 border">{p.userId ? `${p.userId.firstName} ${p.userId.lastName}` : "-"}</td>
                                    <td className="p-2 border">{p.planId?.planName || "-"}</td>
                                    <td className="p-2 border">₦{p.amount.toLocaleString()}</td>
                                    <td className="p-2 border"><StatusBadge status={p.status} /></td>
                                    <td className="p-2 border">{new Date(p.createdAt).toLocaleString()}</td>
                                    <td className="p-2 border">
                                        <div className="relative">
                                            <button
                                                onClick={() => openPaymentModal(p)}
                                                className="p-1 rounded hover:bg-gray-100 transition"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-surface dark:bg-gray-800 p-1 rounded shadow opacity-0 group-hover:opacity-100 transition text-xs">
                                                View Details
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-muted p-4">No payments found.</p>
            )}

            {/* Payment Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                {paymentDetails ? (
                    <div className="space-y-3">
                        <h2 className="text-xl font-bold">Payment Details</h2>
                        <p><strong>Transaction:</strong> {paymentDetails.transactionId}</p>
                        <p><strong>User:</strong> {paymentDetails.userId?.firstName} {paymentDetails.userId?.lastName}</p>
                        <p><strong>Email:</strong> {paymentDetails.userId?.email}</p>
                        <p><strong>WSN ID:</strong> {paymentDetails.userId?.wsnId}</p>
                        <p><strong>Plan:</strong> {paymentDetails.planId?.planName}</p>
                        <p><strong>Amount:</strong> ₦{paymentDetails.amount.toLocaleString()}</p>
                        <p><strong>Status:</strong> <StatusBadge status={paymentDetails.status} /></p>

                        {paymentDetails.status !== "successful" && (
                            <button
                                onClick={handleActivate}
                                className="border border-green-500 text-green-500 rounded px-3 py-1 hover:bg-green-500/10 transition"
                            >
                                Activate Payment
                            </button>
                        )}
                    </div>
                ) : (
                    <Spinner message="Loading payment details..." />
                )}
            </Modal>

            {/* Mobile Filter Modal */}
            <Modal open={filterModalOpen} onClose={() => setFilterModalOpen(false)} closeOnOutsideClick>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Filter size={20} /> Filters
                </h2>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="WSN ID"
                        value={filters.wsnId}
                        onChange={(e) => setFilters({ ...filters, wsnId: e.target.value })}
                        className="input w-full"
                    />
                    <input
                        type="text"
                        placeholder="Plan Name"
                        value={filters.planName}
                        onChange={(e) => setFilters({ ...filters, planName: e.target.value })}
                        className="input w-full"
                    />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="input w-full"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="successful">Successful</option>
                        <option value="failed">Failed</option>
                        <option value="expired">Expired</option>
                        <option value="fout">Fout</option>
                    </select>

                    <div>
                        <label className="text-sm text-muted">From</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-muted">To</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="input w-full"
                        />
                    </div>

                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => { setPage(1); setFilterModalOpen(false); }}
                            className="border border-primary text-primary rounded px-3 py-1 hover:bg-primary/10 transition"
                        >
                            Apply
                        </button>
                        <button
                            onClick={resetFilters}
                            className="border border-red-500 text-red-500 rounded px-3 py-1 hover:bg-red-500/10 transition"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminPayments;
