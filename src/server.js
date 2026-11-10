require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

// Render provides PORT automatically.
// Use 5001 for local development.
const PORT = process.env.PORT || 5001;

// Listen on all network interfaces.
const HOST = "0.0.0.0";


// ============================================
// START SERVER
// ============================================

const startServer = async () => {
    try {
        // Connect to MongoDB first
        await connectDB();

        // Start Express server
        const server = app.listen(PORT, HOST, () => {
            console.log("MongoDB connection ready.");
            console.log(`Server running on ${HOST}:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
            console.log(`Missions API: http://localhost:${PORT}/api/missions`);
        });

        server.on("error", (error) => {
            console.error("HTTP server error:", error.message);
            process.exit(1);
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
