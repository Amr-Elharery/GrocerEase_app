const analyticsService = require("../services/analytics.service");

function getUserId(req) {
  return req.user?.id || Number(req.query.userId) || 3;
}

async function weeklyTrend(req, res) {
  const userId = getUserId(req);

  const weeks = Number(req.query.weeks ?? 4);

  if (!Number.isInteger(weeks) || weeks < 1 || weeks > 12) {
    return res.status(400).json({
      message: "weeks must be an integer between 1 and 12",
    });
  }

  const trend = await analyticsService.getWeeklyTrend(userId, weeks);
  return res.status(200).json(trend);
}

async function weeklySummary(req, res) {
  const userId = getUserId(req);

  const summary = await analyticsService.getWeeklySummary(userId);
  return res.status(200).json(summary);
}

async function monthlySummary(req, res) {
  const userId = getUserId(req);

  const summary = await analyticsService.getMonthlySummary(userId);
  return res.status(200).json(summary);
}

module.exports = {
  weeklyTrend,
  weeklySummary,
  monthlySummary,
};
