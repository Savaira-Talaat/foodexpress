import request from "supertest";
import app from "../server.js";
import mongoose from "mongoose";
import { User } from "../mongo.js";
import jwt from "jsonwebtoken";
import { SECRET } from "../middlewares/authentication.js";

let adminToken;
let userToken;
let adminId;
let userId;
let otherUserId;

beforeAll(async () => {
    await User.deleteMany({});

    const admin = await User.create({ 
        email: "admin@test.com", 
        username: "admin", 
        password: "hashedPassword123", 
        role: "admin" 
    });
    
    const user = await User.create({ 
        email: "user@test.com", 
        username: "user", 
        password: "hashedPassword456", 
        role: "user" 
    });

    const otherUser = await User.create({
        email: "other@test.com",
        username: "otheruser",
        password: "hashedPassword789",
        role: "user"
    });

    adminId = admin._id.toString();
    userId = user._id.toString();
    otherUserId = otherUser._id.toString();

    adminToken = jwt.sign({ id: adminId, role: "admin" }, SECRET);
    userToken = jwt.sign({ id: userId, role: "user" }, SECRET);
});

afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
});

describe("Users API", () => {
    
    describe("GET /users - List all users", () => {
        test("Should return all users for admin", async () => {
            const res = await request(app)
                .get("/users")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(3);
        });

        test("Should fail without authentication", async () => {
            const res = await request(app).get("/users");

            expect(res.statusCode).toBe(401);
        });

        test("Should fail for regular user (not admin)", async () => {
            const res = await request(app)
                .get("/users")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe("GET /users/:id - Get single user", () => {
        test("Should return a user for admin", async () => {
            const res = await request(app)
                .get(`/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("_id");
            expect(res.body.email).toBe("user@test.com");
        });

        test("Should fail without authentication", async () => {
            const res = await request(app).get(`/users/${userId}`);

            expect(res.statusCode).toBe(401);
        });

        test("Should fail for regular user (not admin)", async () => {
            const res = await request(app)
                .get(`/users/${adminId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe("PUT /users/:id - Update user", () => {
        test("Should allow user to update their own account", async () => {
            const res = await request(app)
                .put(`/users/${userId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    email: "user@test.com",
                    username: "updateduser",
                    password: "newPassword123"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/modifié/);
            expect(res.body.user.username).toBe("updateduser");
        });

        test("Should allow admin to update any user", async () => {
            const res = await request(app)
                .put(`/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    email: "user@test.com",
                    username: "adminupdated",
                    password: "newPassword456"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.user.username).toBe("adminupdated");
        });

        test("Should prevent user from updating another user's account", async () => {
            const res = await request(app)
                .put(`/users/${otherUserId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    username: "hacked",
                    password: "hack123"
                });

            expect(res.statusCode).toBe(403);
        });

        test("Should fail when email already exists", async () => {
            const res = await request(app)
                .put(`/users/${userId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    email: "admin@test.com",
                    username: "user",
                    password: "password123"
                });

            expect(res.statusCode).toBe(409);
            expect(res.body.message).toMatch(/Email déjà existant/);
        });

        test("Should return 404 for non-existent user", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/users/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    username: "test",
                    password: "test123"
                });

            expect(res.statusCode).toBe(404);
        });

        test("Should fail without authentication", async () => {
            const res = await request(app)
                .put(`/users/${userId}`)
                .send({
                    username: "nope",
                    password: "nope123"
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe("DELETE /users/:id - Delete user", () => {
        test("Should allow user to delete their own account", async () => {
            const tempUser = await User.create({
                email: "temp@test.com",
                username: "tempuser",
                password: "temp123",
                role: "user"
            });
            const tempToken = jwt.sign({ id: tempUser._id.toString(), role: "user" }, SECRET);

            const res = await request(app)
                .delete(`/users/${tempUser._id}`)
                .set("Authorization", `Bearer ${tempToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/supprimé/);

            const deletedUser = await User.findById(tempUser._id);
            expect(deletedUser).toBeNull();
        });

        test("Should allow admin to delete any user", async () => {
            const tempUser = await User.create({
                email: "temp2@test.com",
                username: "tempuser2",
                password: "temp456",
                role: "user"
            });

            const res = await request(app)
                .delete(`/users/${tempUser._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/supprimé/);
        });

        test("Should prevent user from deleting another user's account", async () => {
            const res = await request(app)
                .delete(`/users/${otherUserId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
        });

        test("Should return 404 for non-existent user", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/users/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
        });

        test("Should fail without authentication", async () => {
            const res = await request(app).delete(`/users/${userId}`);

            expect(res.statusCode).toBe(401);
        });
    });
});