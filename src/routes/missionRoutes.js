const express = require("express");
const router = express.Router();

const Mission = require("../models/Mission");

// Helper function for creating HTTP errors
const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};


// ============================================
// POST: Create a new mission
// ============================================

router.post("/", async (req, res, next) => {
    try {
        const {
            missionName,
            destination,
            objective,
            status
        } = req.body;

        const mission = await Mission.create({
            missionName,
            destination,
            objective,
            status
        });

        res.status(201).json({
            success: true,
            message: "Mission created successfully!",
            data: mission
        });

    } catch (error) {
        next(error);
    }
});


// ============================================
// GET: Retrieve all missions
// ============================================

router.get("/", async (req, res, next) => {
    try {
        const missions = await Mission.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: missions.length,
            data: missions
        });

    } catch (error) {
        next(error);
    }
});


// ============================================
// PATCH: Update an existing mission
// ============================================

router.patch("/:id", async (req, res, next) => {
    try {
        const updates = {};

        const allowedFields = [
            "missionName",
            "destination",
            "objective",
            "status"
        ];

        // Accept only permitted update fields
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        // Reject empty update requests
        if (Object.keys(updates).length === 0) {
            throw createHttpError(
                "Please provide at least one field to update.",
                400
            );
        }

        const mission = await Mission.findByIdAndUpdate(
            req.params.id,
            updates,
           {
    returnDocument: "after",
    runValidators: true
}
        );

        // Check if the mission exists
        if (!mission) {
            throw createHttpError(
                "Mission not found.",
                404
            );
        }

        res.status(200).json({
            success: true,
            message: "Mission updated successfully!",
            data: mission
        });

    } catch (error) {
        next(error);
    }
});


// ============================================
// DELETE: Remove an existing mission
// ============================================

router.delete("/:id", async (req, res, next) => {
    try {
        const mission = await Mission.findByIdAndDelete(
            req.params.id
        );

        // Check if the mission exists
        if (!mission) {
            throw createHttpError(
                "Mission not found.",
                404
            );
        }

        res.status(200).json({
            success: true,
            message: "Mission deleted successfully!",
            data: mission
        });

    } catch (error) {
        next(error);
    }
});


// ============================================
// EXPORT ROUTER
// ============================================

module.exports = router;
