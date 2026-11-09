const mongoose = require("mongoose");

const connectDB = async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri || uri.includes("YOUR_")) {
        throw new Error("MongoDB connection string is missing or incomplete.");
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000
        });

        console.log("MongoDB connected successfully!");
        console.log(`Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

module.exports = connectDB;
