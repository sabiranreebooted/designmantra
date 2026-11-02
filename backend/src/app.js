const express = require("express");
const userRoutes = require("./routes/productRoute");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// User APIs
app.use("/api/users", userRoutes);

module.exports = app;