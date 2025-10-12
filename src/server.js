import express from "express";
import session from "express-session";
import "./mongo.js";
import users from "./routes/users.js";
import authentication from "./routes/authentication.js"
import myAccount from "./routes/my-account.js"

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

export default app;