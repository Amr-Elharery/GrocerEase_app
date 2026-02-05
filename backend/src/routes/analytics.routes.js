const express = require("express");
const asyncHandler = require("../middlewares/asyncHandler");
const analyticsController = require("../controllers/analytics.controller");

const router = express.Router();

router.get("/weekly-trend", asyncHandler(analyticsController.weeklyTrend));
router.get("/weekly-summary", asyncHandler(analyticsController.weeklySummary));
router.get("/monthly-summary", asyncHandler(analyticsController.monthlySummary));

module.exports = router;
