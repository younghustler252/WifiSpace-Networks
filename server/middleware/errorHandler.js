// middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
    // Default status code
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    // Log detailed error in backend
    console.error(`
❌ Error:
  Message: ${err.message}
  Stack: ${err.stack}
  Route: ${req.method} ${req.originalUrl}
  User: ${req.user ? req.user.id : "Guest"}
    `);

    // Send clean JSON response to frontend
    res.status(statusCode).json({
        success: false,
        message: err.message || "Server Error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack, // show stack only in dev
    });
};

module.exports = { errorHandler };
