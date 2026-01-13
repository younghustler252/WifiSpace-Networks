// CommonJS
module.exports = (err, req, res, next) => {
	const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

	console.error(`
❌ Error:
  Message: ${err.message}
  Stack: ${err.stack}
  Route: ${req.method} ${req.originalUrl}
  User: ${req.user ? req.user.id : "Guest"}
  `);

	res.status(statusCode).json({
		success: false,
		message: err.message || "Server Error",
		stack: process.env.NODE_ENV === "production" ? null : err.stack,
	});
};
