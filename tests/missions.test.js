
require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const request = require("supertest");

const app = require("../src/app");
const Mission = require("../src/models/Mission");


// ============================================
// AUTOMATED MISSION CRUD TEST
// ============================================

test("Mission API should support all CRUD operations", async () => {

    let connected = false;

    try {
        // Connect to a separate testing database
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "deployment_practice_test"
        });

        connected = true;

// Test connected database health check
const healthResponse = await request(app).get("/api/health");

assert.equal(healthResponse.status, 200);

assert.deepEqual(healthResponse.body, {
    success: true,
    api: "running",
    database: "connected"
});

console.log("CONNECTED HEALTH CHECK passed");

        // Clear previous test data
        await Mission.deleteMany({});


        // ====================================
        // TEST 1: CREATE A MISSION
        // ====================================

        const createResponse = await request(app)
            .post("/api/missions")
            .send({
                missionName: "Automated Test Mission",
                destination: "Mars",
                objective: "Testing automated mission creation.",
                status: "Planning"
            });

        assert.equal(createResponse.status, 201);
        assert.equal(createResponse.body.success, true);
        assert.equal(
            createResponse.body.data.missionName,
            "Automated Test Mission"
        );

        const missionId = createResponse.body.data._id;

        console.log("CREATE test passed");


        // ====================================
        // TEST 2: READ ALL MISSIONS
        // ====================================

        const readResponse = await request(app)
            .get("/api/missions");

        assert.equal(readResponse.status, 200);
        assert.equal(readResponse.body.success, true);
        assert.equal(readResponse.body.count, 1);

        console.log("READ test passed");


        // ====================================
        // TEST 3: UPDATE THE MISSION
        // ====================================

        const updateResponse = await request(app)
            .patch(`/api/missions/${missionId}`)
            .send({
                status: "In Progress",
                objective: "Automated testing of Mars mission updates."
            });

        assert.equal(updateResponse.status, 200);
        assert.equal(
            updateResponse.body.data.status,
            "In Progress"
        );

        console.log("UPDATE test passed");


        // ====================================
        // TEST 4: DELETE THE MISSION
        // ====================================

        const deleteResponse = await request(app)
            .delete(`/api/missions/${missionId}`);

        assert.equal(deleteResponse.status, 200);
        assert.equal(deleteResponse.body.success, true);

        console.log("DELETE test passed");


        // ====================================
        // TEST 5: VERIFY DELETION
        // ====================================

        const finalResponse = await request(app)
            .get("/api/missions");

        assert.equal(finalResponse.status, 200);
        assert.equal(finalResponse.body.count, 0);

        console.log("FINAL DATABASE CHECK passed");


        // ====================================
        // NEGATIVE TEST 1: Missing required fields
        // ====================================

        const missingFieldsResponse = await request(app)
            .post("/api/missions")
            .send({
                objective: "Testing missing fields."
            });

        assert.equal(missingFieldsResponse.status, 400);
        assert.equal(missingFieldsResponse.body.success, false);
        assert.match(missingFieldsResponse.body.message, /missionName/);
        assert.match(missingFieldsResponse.body.message, /destination/);

        console.log("NEGATIVE TEST 1 passed");


        // ====================================
        // NEGATIVE TEST 2: Invalid status
        // ====================================

        const invalidStatusResponse = await request(app)
            .post("/api/missions")
            .send({
                missionName: "Invalid Status Test",
                destination: "Mars",
                status: "Launched"
            });

        assert.equal(invalidStatusResponse.status, 400);
        assert.equal(invalidStatusResponse.body.success, false);

        console.log("NEGATIVE TEST 2 passed");


        // ====================================
        // NEGATIVE TEST 3: Invalid MongoDB ID
        // ====================================

        const invalidIdResponse = await request(app)
            .patch("/api/missions/not-a-valid-id")
            .send({
                status: "Completed"
            });

        assert.equal(invalidIdResponse.status, 400);
        assert.equal(
            invalidIdResponse.body.message,
            "Invalid mission ID format."
        );

        console.log("NEGATIVE TEST 3 passed");


        // ====================================
        // NEGATIVE TEST 4: Nonexistent mission
        // ====================================

        const missingMissionResponse = await request(app)
            .patch("/api/missions/000000000000000000000000")
            .send({
                status: "Completed"
            });

        assert.equal(missingMissionResponse.status, 404);
        assert.equal(
            missingMissionResponse.body.message,
            "Mission not found."
        );

        console.log("NEGATIVE TEST 4 passed");


        // ====================================
        // NEGATIVE TEST 5: Empty update
        // ====================================

        const emptyUpdateResponse = await request(app)
            .patch(`/api/missions/${missionId}`)
            .send({});

        assert.equal(emptyUpdateResponse.status, 400);
        assert.equal(
            emptyUpdateResponse.body.message,
            "Please provide at least one field to update."
        );

        console.log("NEGATIVE TEST 5 passed");


        // ====================================
        // NEGATIVE TEST 6: Delete nonexistent mission
        // ====================================

        const missingDeleteResponse = await request(app)
            .delete("/api/missions/000000000000000000000000");

        assert.equal(missingDeleteResponse.status, 404);
        assert.equal(
            missingDeleteResponse.body.message,
            "Mission not found."
        );

        console.log("NEGATIVE TEST 6 passed");


    } finally {

        // Clean up test data and close the connection
        if (connected) {
            await Mission.deleteMany({});
            await mongoose.disconnect();
        }
    }
});
