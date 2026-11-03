const bookingRoutes = require("./routes/bookingRoutes");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const studioRoutes = require("./routes/studioRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("StudioSpace Server is running!");
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StudioSpace API is healthy",
  });
});

// Studio routes
app.use("/api/studios", studioRoutes);
app.use("/api/bookings", bookingRoutes);

// Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`StudioSpace server running on port ${PORT}`);
  });
};

startServer();
