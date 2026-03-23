class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message || 'Invalid input data', 400);
    }
}

class AuthenticationError extends AppError {
    constructor(message) {
        super(message || 'Authentication failed', 401);
    }
}

class ForbiddenError extends AppError {
    constructor(message) {
        super(message || 'You do not have permission to perform this action', 403);
    }
}

class NotFoundError extends AppError {
    constructor(message) {
        super(message || 'Requested resource not found', 404);
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    ForbiddenError,
    NotFoundError
};
