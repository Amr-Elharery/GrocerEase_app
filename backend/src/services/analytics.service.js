const pool = require("../db");

async function getWeeklyTrend(userId, weeks = 4) {
  const query = `
    WITH week_series AS (
      SELECT generate_series(
        date_trunc('week', NOW()) - ($2::int - 1) * INTERVAL '1 week',
        date_trunc('week', NOW()),
        INTERVAL '1 week'
      )::date AS week
    ),
    weekly_totals AS (
      SELECT
        date_trunc('week', created_at)::date AS week,
        SUM(total_price) AS total
      FROM orders
      WHERE user_id = $1
        AND created_at >= date_trunc('week', NOW()) - ($2::int - 1) * INTERVAL '1 week'
      GROUP BY week
    )
    SELECT
      ws.week,
      COALESCE(wt.total, 0) AS total
    FROM week_series ws
    LEFT JOIN weekly_totals wt ON ws.week = wt.week
    ORDER BY ws.week ASC;
  `;

  const { rows } = await pool.query(query, [userId, weeks]);

  return rows.map((r) => ({
    week: r.week,
    total: Number(r.total),
  }));
}

async function getWeeklySummary(userId) {
  const query = `
    SELECT
      COALESCE(SUM(CASE
        WHEN created_at >= date_trunc('week', NOW())
        THEN total_price
      END), 0) AS current_week,

      COALESCE(SUM(CASE
        WHEN created_at >= date_trunc('week', NOW()) - INTERVAL '1 week'
         AND created_at <  date_trunc('week', NOW())
        THEN total_price
      END), 0) AS last_week
    FROM orders
    WHERE user_id = $1;
  `;

  const { rows } = await pool.query(query, [userId]);

  return {
    current_week: Number(rows[0].current_week),
    last_week: Number(rows[0].last_week),
  };
}

async function getMonthlySummary(userId) {
  const query = `
    SELECT
      COALESCE(SUM(CASE
        WHEN created_at >= date_trunc('month', NOW())
        THEN total_price
      END), 0) AS current_month,

      COALESCE(SUM(CASE
        WHEN created_at >= date_trunc('month', NOW()) - INTERVAL '1 month'
         AND created_at <  date_trunc('month', NOW())
        THEN total_price
      END), 0) AS last_month
    FROM orders
    WHERE user_id = $1;
  `;

  const { rows } = await pool.query(query, [userId]);

  return {
    current_month: Number(rows[0].current_month),
    last_month: Number(rows[0].last_month),
  };
}

module.exports = {
  getWeeklyTrend,
  getWeeklySummary,
  getMonthlySummary,
};
