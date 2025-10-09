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