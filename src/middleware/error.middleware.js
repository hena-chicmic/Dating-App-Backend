function errorHandler(err, req, res, next) {
    // Log full error for developers
    console.error(err.stack);

    const isProduction = process.env.NODE_ENV === 'production';
    
    // Default error values
    let statusCode = err.status || 500;
    let message = err.message || "Internal server error";

    // Sanitize message in production
    if (isProduction && statusCode === 500) {
        message = "Something went wrong on our end. Please try again later.";
    }

    // Handle specific DB errors at the middleware level (optional but good)
    if (err.code && err.code.startsWith('23')) { // Postgres constraint violations
        statusCode = 400;
        if (isProduction) {
            message = "A conflict occurred with the data provided.";
        }
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(isProduction ? {} : { stack: err.stack, details: err })
    });
}

module.exports=errorHandler
