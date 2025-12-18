import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; // <-- React Router DOM
import { useVerifyPaymentStatus } from "../hooks/usePayment";
import { Spinner } from "../components/ui/Loader";
import { CheckCircle, XCircle } from "lucide-react";

const PaymentSuccess = () => {
    const searchParams = useSearchParams()[0]; // React Router v6
    const navigate = useNavigate();

    const reference = searchParams.get("reference");

    const {
        mutateAsync: verifyPaymentStatus,
        isLoading,
        data,
        isError,
        error,
    } = useVerifyPaymentStatus();

    // Verify when reference becomes available
    React.useEffect(() => {
        if (reference) {
            verifyPaymentStatus(reference);
        }
    }, [reference, verifyPaymentStatus]);

    if (isLoading) return <Spinner message="Verifying payment..." />;

    if (isError)
        return (
            <p className="text-red-500 text-center">
                Error verifying payment: {error?.message}
            </p>
        );

    const payment = data?.payment;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold text-primary mb-6">Payment Status</h1>

            {data?.message === "Payment verified successfully" ? (
                <div className="p-6 rounded-xl bg-green-50 border border-green-300 text-green-700 shadow-sm text-center">
                    <CheckCircle size={40} className="mx-auto text-green-500" />
                    <h2 className="text-xl font-semibold mt-4">Payment Successful!</h2>

                    <p className="mt-2">
                        Your subscription has been activated for <strong>{payment?.planName}</strong>.
                    </p>

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="mt-6 px-6 py-2 bg-primary text-white rounded-lg"
                    >
                        Go to Dashboard
                    </button>
                </div>
            ) : (
                <div className="p-6 rounded-xl bg-red-50 border border-red-300 text-red-700 shadow-sm text-center">
                    <XCircle size={40} className="mx-auto text-red-500" />
                    <h2 className="text-xl font-semibold mt-4">Payment Failed</h2>

                    <p className="mt-2">The payment could not be completed.</p>

                    <button
                        onClick={() => navigate("/subscription")}
                        className="mt-6 px-6 py-2 bg-primary text-white rounded-lg"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaymentSuccess;
