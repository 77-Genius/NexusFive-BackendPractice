const notFound = (req, res, next) => {
    const error = new Error(
        `Route not found: ${req.method} ${req.originalUrl}`
    );

    error.statusCode = 404;

    next(error);
};


const errorHandler = (err, req, res, next) => {

    // If headers have already been sent, delegate to Express
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = err.statusCode || 500;
    let message = err.message;

    // Mongoose validation errors
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = err.message;
    }

    // Invalid MongoDB IDs
    else if (err.name === "CastError") {
        statusCode = 400;

        message = err.path === "_id"
            ? "Invalid mission ID format."
            : `Invalid value for ${err.path}.`;
    }

    // Hide unexpected internal server errors
    else if (statusCode === 500) {
        message = "Internal server error.";
    }

    // Log detailed errors on the server
    console.error(
        `[${statusCode}] ${req.method} ${req.originalUrl}:`,
        err.message
    );

    res.status(statusCode).json({
        success: false,
        message
    });
};


module.exports = {
    notFound,
    errorHandler
};
