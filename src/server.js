import express from "express";
import session from "express-session";
import "./mongo.js";
import users from "./routes/users.js";
import authentication from "./routes/authentication.js"
import myAccount from "./routes/my-account.js"
import restaurants from "./routes/restaurants.js"
import menus from "./routes/menus.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";
import { Restaurants } from "./mongo.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Route pour la documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "FoodExpress API Documentation"
}));


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