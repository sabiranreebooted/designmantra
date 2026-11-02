const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/productRoute");
const contentRoutes = require("./routes/contentRoute");
const adminRoutes = require("./routes/adminRoute");
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(require("path").join(__dirname, "../uploads")));

// User APIs
app.use("/api/users", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/admin", adminRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "Image must be 5 MB or smaller.",
    });
  }

  if ([400, 401, 403, 404, 409].includes(error.status)) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
    });
  }

  console.error("API request failed:", error.message);
  return res.status(500).json({
    success: false,
    message: "The server could not complete the request.",
  });
});

module.exports = app;