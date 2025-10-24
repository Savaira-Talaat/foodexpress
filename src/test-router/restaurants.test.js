import request from "supertest";
import app from "../server.js";
import mongoose from "mongoose";
import { User, Restaurants } from "../mongo.js";
import jwt from "jsonwebtoken";
import { SECRET } from "../middlewares/authentication.js";

let adminToken;
let userToken;
let restaurantId;

beforeAll(async () => {
    await User.deleteMany({});
    await Restaurants.deleteMany({});

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
    adminToken = jwt.sign({ id: admin._id.toString(), role: "admin" }, SECRET);
    userToken = jwt.sign({ id: user._id.toString(), role: "user" }, SECRET);
});

afterAll(async () => {
    await User.deleteMany({});
    await Restaurants.deleteMany({});
    await mongoose.connection.close();
});

describe("Restaurants API", () => {
    
    describe("POST /restaurants/create-restaurant - Create restaurant", () => {
        test("Should create a restaurant as admin", async () => {
            const res = await request(app)
                .post("/restaurants/create-restaurant")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Le Gourmet",
                    address: "123 Rue de Paris",
                    phone: "0123456789",
                    opening_hours: "10h-22h"
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toMatch(/créé avec succès/);
            expect(res.body).toHaveProperty("id");
            restaurantId = res.body.id;
        });

        test("Should fail without authentication", async () => {
            const res = await request(app)
                .post("/restaurants/create-restaurant")
                .send({
                    name: "Restaurant Sans Auth",
                    address: "456 Rue Test",
                    phone: "0987654321",
                    opening_hours: "11h-23h"
                });

            expect(res.statusCode).toBe(401);
        });

        test("Should fail for regular user (not admin)", async () => {
            const res = await request(app)
                .post("/restaurants/create-restaurant")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    name: "Restaurant User",
                    address: "789 Rue User",
                    phone: "0555555555",
                    opening_hours: "12h-21h"
                });

            expect(res.statusCode).toBe(403);
        });
    });

    describe("GET /restaurants - List restaurants with pagination", () => {
        beforeAll(async () => {
            await Restaurants.deleteMany({});
            for (let i = 1; i <= 15; i++) {
                await Restaurants.create({
                    name: `Restaurant ${i}`,
                    address: `${i} Rue Test`,
                    phone: `012345678${i}`,
                    opening_hours: "9h-21h"
                });
            }
        });

        test("Should return paginated restaurants (default page 1)", async () => {
            const res = await request(app).get("/restaurants");

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("data");
            expect(res.body).toHaveProperty("meta");
            expect(res.body.meta.per_page).toBe(10);
            expect(res.body.data.length).toBe(10);
        });

        test("Should return page 2 of restaurants", async () => {
            const res = await request(app).get("/restaurants?page=2");

            expect(res.statusCode).toBe(200);
            expect(res.body.meta.current_page).toBe(2);
            expect(res.body.data.length).toBe(5);
        });

        test("Should include pagination links", async () => {
            const res = await request(app).get("/restaurants?page=1");

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("links");
            expect(res.body.links.next).toBe("?page=2");
            expect(res.body.links.prev).toBeNull();
        });

        test("Should return total count and pages", async () => {
            const res = await request(app).get("/restaurants");

            expect(res.statusCode).toBe(200);
            expect(res.body.meta.total).toBe(15);
            expect(res.body.meta.total_pages).toBe(2);
        });
    });

    describe("GET /restaurants/by-name/:name - Search by name", () => {
        test("Should find restaurant by exact name", async () => {
            const res = await request(app).get("/restaurants/by-name/Restaurant 1");

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe("Restaurant 1");
        });

        test("Should return 404 for non-existent name", async () => {
            const res = await request(app).get("/restaurants/by-name/Restaurant Inexistant");

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toMatch(/Aucun restaurant trouvé/);
        });
    });

    describe("GET /restaurants/by-address/:address - Search by address", () => {
        test("Should find restaurant by exact address", async () => {
            const res = await request(app).get("/restaurants/by-address/1 Rue Test");

            expect(res.statusCode).toBe(200);
            expect(res.body.address).toBe("1 Rue Test");
        });

        test("Should return 404 for non-existent address", async () => {
            const res = await request(app).get("/restaurants/by-address/999 Rue Fantome");

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toMatch(/Aucun restaurant trouvé/);
        });
    });

    describe("GET /restaurants/:id - Get single restaurant", () => {
        test("Should return a restaurant by ID", async () => {
            const restaurant = await Restaurants.findOne({ name: "Restaurant 1" });
            const res = await request(app).get(`/restaurants/${restaurant._id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe("Restaurant 1");
            expect(res.body._id).toBe(restaurant._id.toString());
        });

        test("Should return 404 for non-existent ID", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/restaurants/${fakeId}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toMatch(/Restaurant non trouvé/);
        });

        test("Should return 400 for invalid ID format", async () => {
            const res = await request(app).get("/restaurants/invalid-id");

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/ID invalide/);
        });
    });

    describe("PUT /restaurants/modify-restaurant/:id - Update restaurant", () => {
        test("Should update a restaurant as admin", async () => {
            const restaurant = await Restaurants.findOne({ name: "Restaurant 1" });
            const res = await request(app)
                .put(`/restaurants/modify-restaurant/${restaurant._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Restaurant Modifié",
                    opening_hours: "8h-23h"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/modifié avec succès/);
            expect(res.body.restaurant.name).toBe("Restaurant Modifié");
            expect(res.body.restaurant.opening_hours).toBe("8h-23h");
        });

        test("Should fail without authentication", async () => {
            const restaurant = await Restaurants.findOne({ name: "Restaurant 2" });
            const res = await request(app)
                .put(`/restaurants/modify-restaurant/${restaurant._id}`)
                .send({
                    name: "Tentative Sans Auth"
                });

            expect(res.statusCode).toBe(401);
        });

        test("Should fail for regular user (not admin)", async () => {
            const restaurant = await Restaurants.findOne({ name: "Restaurant 2" });
            const res = await request(app)
                .put(`/restaurants/modify-restaurant/${restaurant._id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    name: "Tentative User"
                });

            expect(res.statusCode).toBe(403);
        });

        test("Should return 404 for non-existent restaurant", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/restaurants/modify-restaurant/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Restaurant Fantome"
                });

            expect(res.statusCode).toBe(404);
        });

        test("Should return 400 for invalid ID format", async () => {
            const res = await request(app)
                .put("/restaurants/modify-restaurant/invalid-id")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Test"
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe("DELETE /restaurants/delete-restaurant/:id - Delete restaurant", () => {
        test("Should delete a restaurant as admin", async () => {
            const restaurant = await Restaurants.findOne({ name: "Restaurant 3" });
            const res = await request(app)
                .delete(`/restaurants/delete-restaurant/${restaurant._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/supprimé avec succès/);

            // Vérifier que le restaurant n'existe plus
            const deletedRestaurant = await Restaurants.findById(restaurant._id);
            expect(deletedRestaurant).toBeNull();
        });

        test("Should fail without authentication", async () => {
            const restaurant = await Restaurants.findOne({ name: "Restaurant 4" });
            const res = await request(app)
                .delete(`/restaurants/delete-restaurant/${restaurant._id}`);

            expect(res.statusCode).toBe(401);
        });

        test("Should fail for regular user (not admin)", async () => {
            const restaurant = await Restaurants.findOne({ name: "Restaurant 4" });
            const res = await request(app)
                .delete(`/restaurants/delete-restaurant/${restaurant._id}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
        });

        test("Should return 404 for non-existent restaurant", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/restaurants/delete-restaurant/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
        });

        test("Should return 400 for invalid ID format", async () => {
            const res = await request(app)
                .delete("/restaurants/delete-restaurant/invalid-id")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(400);
        });
    });
});