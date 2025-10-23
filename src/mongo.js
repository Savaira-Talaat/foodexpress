import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/foodexpress";
const DBNAME = "foodexpress"

mongoose.connect(MONGODB_URI, {
    dbName: DBNAME,
});

mongoose.connection.on("error", (e) => {
    console.log("Erreur", e.toString())
});

mongoose.connection.on("connected", () => {
    console.log("Connecté à la base de données MongoDB")
});

const UserSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    role: { type: String, default: 'user' }
});

export const User = mongoose.model("User", UserSchema);

const RestaurantsSchema = new mongoose.Schema({
    id: Number,
    name: String,
    address: String,
    phone: String,
    opening_hours: String,}
);

export const Restaurants = mongoose.model("Restaurants", RestaurantsSchema);

const MenuSchema = new mongoose.Schema({
    id: Number,
    restaurant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Restaurants,
        required: true
    },
    name: String,
    description: String,
    price: Number,
    category: String
});

export const Menus = mongoose.model("Menus", MenuSchema);