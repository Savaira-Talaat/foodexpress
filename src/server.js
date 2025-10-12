import express from "express";
import session from "express-session";
import "./mongo.js";
import users from "./routes/users.js";
import authentication from "./routes/authentication.js"

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

export default app;