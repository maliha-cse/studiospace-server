
const express = require("express");
const mongoose = require("mongoose");
const Studio = require("../models/Studio");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// GET all studios
router.get("/", async (req, res) => {
  try {
    const studios = await Studio.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: studios.length,
      data: studios,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch studios",
    });
  }
});

// GET my listings (Protected)
router.get("/my-listings", verifyToken, async (req, res) => {
  try {
    const studios = await Studio.find({
      hostEmail: req.user.email,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: studios.length,
      data: studios,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch your studios",
    });
  }
});

// UPDATE own studio (Protected)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
    }

    const studio = await Studio.findById(id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    // Only the owner can update
    if (
      studio.hostEmail.toLowerCase() !==
      req.user.email.toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this studio",
      });
    }

    const allowedFields = [
      "title",
      "category",
      "hourlyRate",
      "securityDeposit",
      "capacity",
      "location",
      "image",
      "gallery",
      "amenities",
      "overview",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const updatedStudio = await Studio.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Studio updated successfully",
      data: updatedStudio,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update studio",
    });
  }
});

// DELETE own studio (Protected)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
    }

    const studio = await Studio.findById(id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    if (
      studio.hostEmail.toLowerCase() !==
      req.user.email.toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this studio",
      });
    }

    await Studio.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Studio deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete studio",
    });
  }
});

// GET single studio by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
    }

    const studio = await Studio.findById(id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    res.status(200).json({
      success: true,
      data: studio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch studio",
    });
  }
});

// POST a new studio (Protected)
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      title,
      category,
      hourlyRate,
      securityDeposit,
      capacity,
      location,
      image,
      gallery,
      amenities,
      overview,
    } = req.body;

    const studio = await Studio.create({
      title,
      category,
      hourlyRate,
      securityDeposit,
      capacity,
      location,
      image,
      gallery,
      amenities,
      overview,
      hostName: req.user.name,
      hostEmail: req.user.email,
      hostPhoto: req.user.image || "",
    });

    res.status(201).json({
      success: true,
      message: "Studio created successfully",
      data: studio,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
