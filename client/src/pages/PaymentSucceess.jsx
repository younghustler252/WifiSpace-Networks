import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useVerifyPaymentStatus } from "../hooks/usePayment";
import { Spinner } from "../components/ui/Loader";
import { CheckCircle, XCircle } from "lucide-react";
import { ROUTE } from "../Routes/Route";
import { motion } from "framer-motion";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("reference");

  const [countdown, setCountdown] = useState(5);

  const {
    mutateAsync: verifyPaymentStatus,
    isLoading,
    data,
    isError,
    error,
  } = useVerifyPaymentStatus();

  // Call API to verify payment
  useEffect(() => {
    if (reference) {
      verifyPaymentStatus(reference).catch((err) => {
        console.error("Payment verification error:", err);
      });
    }
  }, [reference, verifyPaymentStatus]);

  // Determine success flag
  const success = data?.payment?.status === "successful";

  // Countdown redirect
  useEffect(() => {
    if (!success) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(ROUTE.dashboard);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [success, navigate]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <Spinner message="Verifying payment..." />
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <XCircle size={70} className="text-red-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-red-700">Payment Failed</h2>
        <p className="text-center text-red-600 max-w-sm">
          {error?.response?.data?.message || error?.message || "The payment could not be completed."}
        </p>
        <button
          onClick={() => navigate(ROUTE.subscriptions)}
          className="btn btn-danger w-full sm:w-auto px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Try Again
        </button>
      </div>
    );

  const payment = data?.payment;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">
        Payment Status
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 rounded-3xl bg-surface border border-border-color shadow-lg flex flex-col items-center space-y-6"
      >
        {success ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <CheckCircle size={70} className="text-success" />
            </motion.div>

            <h2 className="text-2xl font-bold text-success">
              Payment Successful!
            </h2>

            <p className="text-center text-primary">
              Your subscription for{" "}
              <strong className="text-accent">{payment?.planName}</strong> is now
              active.
            </p>

            <p className="text-sm text-secondary text-center">
              Redirecting to dashboard in <strong>{countdown}</strong> seconds...
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(ROUTE.dashboard)}
              className="btn btn-success w-full sm:w-auto px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Go to Dashboard Now
            </motion.button>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <XCircle size={70} className="text-red-500" />
            </motion.div>

            <h2 className="text-2xl font-bold text-red-700">Payment Failed</h2>

            <p className="text-center text-red-600">
              {data?.message || "Something went wrong. Please try again."}
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(ROUTE.subscriptions)}
              className="btn btn-danger w-full sm:w-auto px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Retry Payment
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
