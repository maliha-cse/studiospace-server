
const mongoose = require("mongoose");

const studioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Photography",
        "Podcast",
        "Music Studio",
        "Film & Video",
        "Art Workshop",
      ],
    },

    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },

    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    gallery: {
      type: [String],
      default: [],
    },

    amenities: {
      type: [String],
      default: [],
    },

    overview: {
      type: String,
      required: true,
      trim: true,
    },

    hostName: {
      type: String,
      required: true,
    },

    hostEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    hostPhoto: {
      type: String,
      default: "",
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Studio", studioSchema);
