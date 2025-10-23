import express from "express";
import session from "express-session";
import "./mongo.js";
import users from "./routes/users.js";
import authentication from "./routes/authentication.js"
import myAccount from "./routes/my-account.js"
import restaurants from "./routes/restaurants.js"
import menus from "./routes/menus.js";
const app = express();

app.use(express.json());
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use("/users", users);
app.use("/authentication", authentication);
app.use("/my-account", myAccount);
app.use("/restaurants", restaurants);
app.use("/menus", menus);

export default app;