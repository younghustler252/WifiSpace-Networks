// utils/paystack.js
const axios = require('axios');
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const FRONTEND_URL_REDIRECT = process.env.FRONTEND_URL + "/payment-success";
const PAYSTACK_BASE_URL = 'https://api.paystack.co';


const paystackHeaders = {
  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
};

// Create a Paystack payment request
const createPaymentRequest = async (amount, email, planName, planId) => {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        amount: amount * 100, // Paystack expects kobo
        email,
        order_id: planId,
        plan_name: planName,
        callback_url: FRONTEND_URL_REDIRECT,
      },
      { headers: paystackHeaders }
    );

    console.log('Paystack initialize response:', response.data); // ✅ this will show success
    return response.data;
  } catch (error) {
    // Print full Axios error details
    console.error('Paystack request failed:', error.response?.data || error.message);
    throw new Error(
      `Paystack initialization failed: ${error.response?.data?.message || error.message}`
    );
  }
};


// Verify payment after user makes the payment
const verifyPayment = async (reference) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      { headers: paystackHeaders }
    );
    return response.data;
  } catch (error) {
    throw new Error('Error verifying Paystack payment');
  }
};

module.exports = { createPaymentRequest, verifyPayment };
