// models/subscriptionModel.js
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true,
      unique: true,
    },

    price: {
      type: Number,
      required: true,
    },

    speedRate: {
      type: String,
      required: true,
    },
    durationDays: { 
      type: Number, 
      default: 30 
    },
    devicesAllowed: {
      type: Number,
      default: 1,
    },

    features: [String],

    // 🔥 REQUIRED: MikroTik profile name for bandwidth limits
    mikrotikProfile: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
