
const express = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Studio = require("../models/Studio");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Create a booking
router.post("/", verifyToken, async (req, res) => {
    try {
        const {
            studioId,
            bookingDate,
            startTime,
            endTime,
        } = req.body;

        if (!studioId || !bookingDate || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Please provide all booking information.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(studioId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid studio ID.",
            });
        }

        const studio = await Studio.findById(studioId);

        if (!studio) {
            return res.status(404).json({
                success: false,
                message: "Studio not found.",
            });
        }

        if (studio.hostEmail.toLowerCase() === req.user.email.toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: "You cannot book your own studio.",
            });
        }

        const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid time values.",
            });
        }

        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);

        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;

        if (
            !Number.isFinite(start) ||
            !Number.isFinite(end) ||
            start < 0 ||
            end > 1439 ||
            end <= start
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid time range.",
            });
        }

        const totalHours = (end - start) / 60;

        if (!Number.isInteger(totalHours)) {
            return res.status(400).json({
                success: false,
                message: "Booking duration must be in full hours.",
            });
        }

        // Prevent overlapping confirmed bookings
        const confirmedBookings = await Booking.find({
            studioId,
            bookingDate,
            status: "confirmed",
        });

        const hasConflict = confirmedBookings.some((booking) => {
            const existingStart =
                Number(booking.startTime.split(":")[0]) * 60 +
                Number(booking.startTime.split(":")[1]);

            const existingEnd =
                Number(booking.endTime.split(":")[0]) * 60 +
                Number(booking.endTime.split(":")[1]);

            return start < existingEnd && end > existingStart;
        });

        if (hasConflict) {
            return res.status(409).json({
                success: false,
                message: "This time slot is already booked.",
            });
        }

        const totalAmount =
            totalHours * studio.hourlyRate + (studio.securityDeposit || 0);

        const booking = await Booking.create({
            studioId,
            studioTitle: studio.title,
            studioImage: studio.image,
            customerName: req.user.name || "Customer",
            customerEmail: req.user.email,
            hostEmail: studio.hostEmail,
            bookingDate,
            startTime,
            endTime,
            totalHours,
            totalAmount,
            status: "pending",
        });

        res.status(201).json({
            success: true,
            message: "Booking request submitted successfully.",
            data: booking,
        });
    } catch (error) {
        console.error("Create booking error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create booking.",
        });
    }
});

// Get logged-in user's bookings
router.get("/my-bookings", verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.find({
            customerEmail: req.user.email.toLowerCase(),
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        console.error("Fetch bookings error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings.",
        });
    }
});

// Cancel a pending booking
router.patch("/:id/cancel", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID.",
            });
        }

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        if (
            booking.customerEmail.toLowerCase() !==
            req.user.email.toLowerCase()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to cancel this booking.",
            });
        }

        if (booking.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending bookings can be cancelled.",
            });
        }

        booking.status = "cancelled";
        await booking.save();

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully.",
            data: booking,
        });
    } catch (error) {
        console.error("Cancel booking error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to cancel booking.",
        });
    }
});

module.exports = router;
