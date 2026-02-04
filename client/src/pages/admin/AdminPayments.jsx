import { useState } from "react";
import { Eye, Filter } from "lucide-react";
import toast from "react-hot-toast";

import {
  useAllPayments,
  useSinglePayment,
  useActivatePayment,
  usePaymentAnalytics,
} from "../../hooks/useAdminPayments";

import { Spinner } from "../../components/ui/Loader";
import PageHeader from "../../components/ui/PageHeader";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";

const AdminPayments = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [filters, setFilters] = useState({
    wsnId: "",
    planName: "",
    status: "",
    startDate: "",
    endDate: "",
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
    setFilters({
      wsnId: "",
      planName: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  const columns = [
    { key: "transactionId", label: "Transaction ID" },
    { key: "user", label: "User" },
    { key: "plan", label: "Plan" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created At" },
    { key: "actions", label: "Actions" },
  ];

  const renderCell = (row, index, key) => {
    switch (key) {
      case "user":
        return row.userId ? `${row.userId.firstName} ${row.userId.lastName}` : "-";
      case "plan":
        return row.planId?.planName || "-";
      case "amount":
        return `₦${row.amount.toLocaleString()}`;
      case "status":
        return <StatusBadge status={row.status} />;
      case "createdAt":
        return new Date(row.createdAt).toLocaleString();
      case "actions":
        return (
          <button
            onClick={() => openPaymentModal(row)}
            className="p-1 rounded hover:bg-gray-100 transition"
          >
            <Eye size={18} />
          </button>
        );
      default:
        return row[key] || "-";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Admin Payments"
        actionLabel="Filters"
        onAction={() => setFilterModalOpen(true)}
      />

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl shadow-md bg-gradient-to-r from-green-100 to-green-50 hover:scale-105 transform transition">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-xl font-bold">₦{analytics.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl shadow-md bg-gradient-to-r from-blue-100 to-blue-50 hover:scale-105 transform transition">
            <p className="text-sm text-gray-600">Total Payments</p>
            <p className="text-xl font-bold">{analytics.totalPayments}</p>
          </div>
          <div className="p-4 rounded-xl shadow-md bg-gradient-to-r from-purple-100 to-purple-50 hover:scale-105 transform transition">
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
          <Input
            placeholder="WSN ID"
            value={filters.wsnId}
            onChange={(e) => setFilters({ ...filters, wsnId: e.target.value })}
          />
          <Input
            placeholder="Plan Name"
            value={filters.planName}
            onChange={(e) => setFilters({ ...filters, planName: e.target.value })}
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
          <Input
            type="date"
            placeholder="From"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <Input
            type="date"
            placeholder="To"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
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

      {/* Payments Table */}
      {loadingPayments ? (
        <Spinner message="Loading payments..." />
      ) : (
        <DataTable
          columns={columns}
          data={paymentsData?.payments || []}
          renderCell={renderCell}
          emptyText="No payments found."
        />
      )}

      {/* Payment Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        {paymentDetails ? (
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Payment Details</h2>
            <p>
              <strong>Transaction:</strong> {paymentDetails.transactionId}
            </p>
            <p>
              <strong>User:</strong> {paymentDetails.userId?.firstName}{" "}
              {paymentDetails.userId?.lastName}
            </p>
            <p>
              <strong>Email:</strong> {paymentDetails.userId?.email}
            </p>
            <p>
              <strong>WSN ID:</strong> {paymentDetails.userId?.wsnId}
            </p>
            <p>
              <strong>Plan:</strong> {paymentDetails.planId?.planName}
            </p>
            <p>
              <strong>Amount:</strong> ₦{paymentDetails.amount.toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <StatusBadge status={paymentDetails.status} />
            </p>

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
      <Modal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        closeOnOutsideClick
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Filter size={20} /> Filters
        </h2>
        <div className="space-y-3">
          <Input
            placeholder="WSN ID"
            value={filters.wsnId}
            onChange={(e) => setFilters({ ...filters, wsnId: e.target.value })}
            fullWidth
          />
          <Input
            placeholder="Plan Name"
            value={filters.planName}
            onChange={(e) => setFilters({ ...filters, planName: e.target.value })}
            fullWidth
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
          <Input
            type="date"
            placeholder="From"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            fullWidth
          />
          <Input
            type="date"
            placeholder="To"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            fullWidth
          />

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                setPage(1);
                setFilterModalOpen(false);
              }}
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
