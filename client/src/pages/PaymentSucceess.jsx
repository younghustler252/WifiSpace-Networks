import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useVerifyPaymentStatus } from "../hooks/usePayment";
import { Spinner } from "../components/ui/Loader";
import { CheckCircle, XCircle } from "lucide-react";
import { ROUTE } from "../Routes/Route";
import { motion } from "framer-motion"; // For smooth animations

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

  useEffect(() => {
    if (reference) {
      verifyPaymentStatus(reference);
    }
  }, [reference, verifyPaymentStatus]);

  // Auto redirect after success
  useEffect(() => {
    if (data?.message?.includes("Payment verified")) {
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
    }
  }, [data, navigate]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Spinner message="Verifying payment..." />
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <XCircle size={60} className="text-red-500" />
        </motion.div>
        <h2 className="text-2xl font-semibold text-red-700">
          Payment Failed
        </h2>
        <p className="text-red-600 text-center max-w-sm">
          {error?.message || "The payment could not be completed."}
        </p>
        <button
          onClick={() => navigate(ROUTE.subscriptions)}
          className="mt-4 px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Try Again
        </button>
      </div>
    );

  const payment = data?.payment;
  const success = data?.message?.includes("Payment verified");

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h1 className="text-3xl font-bold text-primary mb-8">Payment Status</h1>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md p-8 rounded-3xl backdrop-blur-md bg-white/20 border border-white/30 shadow-lg flex flex-col items-center space-y-6"
      >
        {success ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.3 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
                repeat: 1,
                repeatType: "reverse",
              }}
            >
              <CheckCircle size={70} className="text-green-500" />
            </motion.div>

            <h2 className="text-2xl font-bold text-green-700">
              Payment Successful!
            </h2>

            <p className="text-center text-green-600">
              Your subscription for <strong>{payment?.planName}</strong> is now
              active.
            </p>

            <p className="text-sm text-green-500">
              Redirecting to dashboard in <strong>{countdown}</strong> seconds...
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(ROUTE.dashboard)}
              className="mt-4 px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
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

            <h2 className="text-2xl font-bold text-red-700">
              Payment Failed
            </h2>

            <p className="text-center text-red-600">
              Something went wrong. Please try again.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(ROUTE.subscriptions)}
              className="mt-4 px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
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
