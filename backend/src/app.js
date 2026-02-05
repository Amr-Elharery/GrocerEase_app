const express = require("express");
const analyticsRoutes = require("./routes/analytics.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(express.json());

// Analytics API
app.use("/api", analyticsRoutes);

// Error middleware last
app.use(errorMiddleware);

module.exports = app;
