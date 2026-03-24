const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

function errorHandler(err, req, res, next) {
    // Log full error for developers using Winston
    logger.error(`${err.message} - ${err.stack}`);

    const isProduction = process.env.NODE_ENV === 'production';
    
    // Default error values
    let statusCode = err.statusCode || 500;
    let status = err.status || 'error';
    let message = err.message || "Internal server error";

    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
        statusCode = 409;
        status = 'fail';
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        message = `A user with this ${field} already exists.`;
    }

    // Handle legacy Postgres constraint violations (kept for safety)
    if (err.code && typeof err.code === 'string' && err.code.startsWith('23')) {
        statusCode = 400;
        status = 'fail';
        message = isProduction 
            ? "A conflict occurred with the data provided." 
            : `Database Error: ${err.detail || err.message}`;
    }

    // Sanitize message in production for 500 errors
    if (isProduction && statusCode === 500) {
        message = "Something went wrong on our end. Please try again later.";
    }

    res.status(statusCode).json({
        success: false,
        status: status,
        message: message,
        ...(isProduction ? {} : { stack: err.stack, details: err })
    });
}

module.exports = errorHandler;
