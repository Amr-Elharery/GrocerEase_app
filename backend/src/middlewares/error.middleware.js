module.exports = function errorMiddleware(err, req, res, next) {
  console.error("ERROR:", err);

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
};
