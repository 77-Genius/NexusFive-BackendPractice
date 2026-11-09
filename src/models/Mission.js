const mongoose = require("mongoose");

const missionSchema = new mongoose.Schema(
    {
        missionName: {
            type: String,
            required: [true, "Mission name is required"],
            trim: true
        },

        destination: {
            type: String,
            required: [true, "Destination is required"],
            trim: true
        },

        objective: {
            type: String,
            default: "",
            trim: true
        },

        status: {
            type: String,
            enum: ["Planning", "In Progress", "Completed"],
            default: "Planning"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Mission", missionSchema);
