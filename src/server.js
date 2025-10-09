import express from "express";
import session from "express-session";

const app = express();

app.use(express.json());
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

export default app;