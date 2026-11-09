
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const { rateLimit } = require("express-rate-limit");

const missionRoutes = require("./routes/missionRoutes");

const {
    notFound,
    errorHandler
} = require("./middleware/errorMiddleware");

const app = express();

// ============================================
// TRUSTED PROXY CONFIGURATION
// ============================================

const trustProxyHops = Number(
    process.env.TRUST_PROXY_HOPS ?? 0
);

if (
    !Number.isInteger(trustProxyHops) ||
    trustProxyHops < 0
) {
    throw new Error("TRUST_PROXY_HOPS must be a non-negative integer.");
}

app.set("trust proxy", trustProxyHops);


// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

const isProduction = process.env.NODE_ENV === "production";


// ============================================
// API RATE LIMITER
// ============================================

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes

    limit: 100, // Maximum 100 requests per IP

    standardHeaders: "draft-8",

    legacyHeaders: false,

    statusCode: 429,

    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});


// ============================================
// SECURITY MIDDLEWARE
// ============================================

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                "upgrade-insecure-requests": isProduction ? [] : null
            }
        },

        // Avoid forcing HTTPS during local development
        strictTransportSecurity: isProduction ? undefined : false
    })
);


// ============================================
// CORS CONFIGURATION
// ============================================

const allowedOrigins = (
    process.env.CLIENT_ORIGINS || "http://localhost:5173"
)
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {

        // Permit requests without a browser Origin header
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Do not expose responses to unapproved browser origins
        return callback(null, false);
    },

    methods: [
        "GET",
        "HEAD",
        "POST",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ],

    maxAge: 600
}));


// ============================================
// GENERAL MIDDLEWARE
// ============================================

app.use(express.json());


// ============================================
// APPLY API RATE LIMITER
// ============================================

app.use("/api", apiLimiter);


// ============================================
// ROOT ENDPOINT
// ============================================

app.get("/", (req, res) => {
    res.json({
        message: "BackendPractice API is running!"
    });
});


// ============================================
// HEALTH-CHECK ENDPOINT
// ============================================

app.get("/api/health", (req, res) => {
    const connected = mongoose.connection.readyState === 1;

    res.status(connected ? 200 : 503).json({
        success: connected,
        api: "running",
        database: connected ? "connected" : "disconnected"
    });
});


// ============================================
// API ROUTES
// ============================================

app.use("/api/missions", missionRoutes);


// ============================================
// CENTRALIZED ERROR HANDLING
// ============================================

// Handle requests to routes that do not exist
app.use(notFound);

// Handle errors passed to Express
app.use(errorHandler);


// ============================================
// EXPORT APPLICATION
// ============================================

module.exports = app;
