import jwt from "jsonwebtoken";

const SECRET = "secret_jwt";

export function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) { 
    return res.status(401).json({ message: "Token manquant" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, SECRET, (err, user) => {
    if (err) {
        return res.status(403).json({ message: "Token invalide" });
    } 
    req.user = user;
    next();
    });
}

export function isAdmin(req, res, next) {
    if (req.user.role === "admin") return next();
    res.status(403).json({ message: "Accès admin uniquement" });
}

export function isUserOrAdmin(req, res, next) {
    const userId = req.params.id;
    const currentUser = req.user;

    if (!currentUser) {
    return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    if (currentUser.role === "admin" || currentUser.id === userId) {
    return next();
    }

    res.status(403).json({ message: "Accès interdit." });
}

export { SECRET };