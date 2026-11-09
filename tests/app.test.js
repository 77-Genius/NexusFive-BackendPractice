const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
require("dotenv").config();

const app = require("../src/app");


// ============================================
// TEST 1: ROOT ENDPOINT
// ============================================

test("GET / should return API running message", async () => {

    const response = await request(app).get("/");

    assert.equal(response.status, 200);

    assert.deepEqual(response.body, {
        message: "BackendPractice API is running!"
    });

});


// ============================================
// TEST 2: UNKNOWN ROUTE
// ============================================

test("Unknown routes should return HTTP 404", async () => {

    const response = await request(app)
        .get("/api/does-not-exist");

    assert.equal(response.status, 404);

    assert.deepEqual(response.body, {
        success: false,
        message: "Route not found: GET /api/does-not-exist"
    });

});

test("GET /api/health should report disconnected database", async () => {

    const response = await request(app).get("/api/health");

    assert.equal(response.status, 503);

    assert.deepEqual(response.body, {
        success: false,
        api: "running",
        database: "disconnected"
    });

});

// ============================================
// TEST: HELMET SECURITY HEADERS
// ============================================

test("Helmet should add security headers", async () => {

    const response = await request(app).get("/");

    assert.equal(response.status, 200);

    assert.equal(
        response.headers["x-content-type-options"],
        "nosniff"
    );

    assert.equal(
        response.headers["x-frame-options"],
        "SAMEORIGIN"
    );

});


// ============================================
// TEST: APPROVED CORS ORIGIN
// ============================================

test("CORS should allow the configured frontend origin", async () => {

    const response = await request(app)
        .get("/")
        .set("Origin", "http://localhost:5173");

    assert.equal(response.status, 200);

    assert.equal(
        response.headers["access-control-allow-origin"],
        "http://localhost:5173"
    );

});


// ============================================
// TEST: UNAPPROVED CORS ORIGIN
// ============================================

test("CORS should not expose responses to unapproved origins", async () => {

    const response = await request(app)
        .get("/")
        .set("Origin", "https://untrusted.example");

    assert.equal(response.status, 200);

    assert.equal(
        response.headers["access-control-allow-origin"],
        undefined
    );

});


// ============================================
// TEST: RATE LIMIT HEADERS
// ============================================

test("API should include rate limit headers", async () => {

    const response = await request(app)
        .get("/api/health");

    assert.ok(
        response.headers["ratelimit"],
        "RateLimit header should be present"
    );

    console.log("RATE LIMIT HEADER test passed");
});


// ============================================
// TEST: EXCEED RATE LIMIT
// ============================================

test("API should reject requests exceeding the rate limit", async () => {

    let response;

    // Send more than the configured 100 requests
    for (let i = 0; i < 110; i++) {
        response = await request(app)
            .get("/api/health");
    }

    assert.equal(response.status, 429);

    assert.deepEqual(response.body, {
        success: false,
        message: "Too many requests. Please try again later."
    });

    console.log("RATE LIMIT 429 test passed");
});
