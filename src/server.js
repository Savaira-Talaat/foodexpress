import express from "express";
import session from "express-session";
import "./mongo.js";
import restaurants from "./routes/restaurants.js";


const app = express();

app.use(express.json());
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use("/restaurants", restaurants);


export default app;