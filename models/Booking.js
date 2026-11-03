
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    studioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Studio",
      required: true,
    },
    studioTitle: {
      type: String,
      required: true,
      trim: true,
    },
    studioImage: {
      type: String,
      default: "",
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    hostEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    bookingDate: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    totalHours: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);
