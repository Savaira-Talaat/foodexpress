import request from "supertest";
import app from "../server.js";
import mongoose from "mongoose";
import { User, Restaurants, Menus } from "../mongo.js";
import jwt from "jsonwebtoken";
import { SECRET } from "../middlewares/authentication.js";

let adminToken;
let userToken;
let restaurantId;
let menuId;

beforeAll(async () => {
    await User.deleteMany({});
    await Restaurants.deleteMany({});
    await Menus.deleteMany({});

    const admin = await User.create({ 
        email: "admin@test.com", 
        username: "admin", 
        password: "1234", 
        role: "admin" 
    });
    const user = await User.create({ 
        email: "user@test.com", 
        username: "user", 
        password: "1234", 
        role: "user" 
    });

    adminToken = jwt.sign({ id: admin._id.toString(), role: "admin" }, SECRET);
    userToken = jwt.sign({ id: user._id.toString(), role: "user" }, SECRET);

    const restaurant = await Restaurants.create({ 
        name: "Test Restaurant", 
        address: "123 rue test", 
        phone: "0123456789", 
        opening_hours: "9h-21h" 
    });
    restaurantId = restaurant._id.toString();
});

afterAll(async () => {
    await User.deleteMany({});
    await Restaurants.deleteMany({});
    await Menus.deleteMany({});
    await mongoose.connection.close();
});

describe("Menus API", () => {
    test("POST /menus should create a new menu (admin only)", async () => {
        const res = await request(app)
            .post("/menus")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ 
                name: "Test Menu", 
                price: 10.5, 
                restaurant_id: restaurantId,
                description: "Menu de test",
                category: "Plat principal"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/créé/);
        
        const createdMenu = await Menus.findOne({ name: "Test Menu" });
        expect(createdMenu).not.toBeNull();
        menuId = createdMenu._id.toString();
    });

    test("POST /menus should fail without restaurant_id", async () => {
        const res = await request(app)
            .post("/menus")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ 
                name: "Invalid Menu", 
                price: 10.5 
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/restaurant_id manquant/);
    });

    test("POST /menus should fail without admin token", async () => {
        const res = await request(app)
            .post("/menus")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ 
                name: "Unauthorized Menu", 
                price: 10.5, 
                restaurant_id: restaurantId 
            });

        expect(res.statusCode).toBe(403);
    });

    test("GET /menus should return paginated menus", async () => {
        const res = await request(app).get("/menus");
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("menus");
        expect(res.body).toHaveProperty("page");
        expect(res.body).toHaveProperty("totalMenus");
        expect(res.body.menus.length).toBeGreaterThan(0);
    });

    test("GET /menus/:id should return a single menu", async () => {
        const res = await request(app).get(`/menus/${menuId}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("Test Menu");
        expect(res.body.price).toBe(10.5);
    });

    test("GET /menus/:id should return 404 for non-existent menu", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app).get(`/menus/${fakeId}`);
        
        expect(res.statusCode).toBe(404);
    });

    test("PUT /menus/:id should update the menu (admin only)", async () => {
        const res = await request(app)
            .put(`/menus/${menuId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ price: 12.5 });

        expect(res.statusCode).toBe(200);
        expect(res.body.menu.price).toBe(12.5);
        expect(res.body.message).toMatch(/modifié/);
    });

    test("PUT /menus/:id should fail without admin token", async () => {
        const res = await request(app)
            .put(`/menus/${menuId}`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({ price: 15.0 });

        expect(res.statusCode).toBe(403);
    });

    test("DELETE /menus/:id should delete the menu (admin only)", async () => {
        const res = await request(app)
            .delete(`/menus/${menuId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/supprimé/);
        
        const deletedMenu = await Menus.findById(menuId);
        expect(deletedMenu).toBeNull();
    });

    test("DELETE /menus/:id should fail without admin token", async () => {
        const menu = await Menus.create({
            name: "Menu to delete",
            price: 20,
            restaurant_id: restaurantId
        });

        const res = await request(app)
            .delete(`/menus/${menu._id}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
    });
});