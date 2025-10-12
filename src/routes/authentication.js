import express, { response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../mongo.js";
import { SECRET } from "../middlewares/authentication.js";

const router = express.Router();
const rounds = 10;

router.post("/register", async (req, res) => {
    bcrypt.hash(req.body.password, rounds, async (error, hash) => {
        if (error) {
            res.status(500).json(error);
        }
        else {
            const newUser = User ({...req.body, password: hash});
            const userEmail = await User.findOne({email: newUser.email})
            if (userEmail !== null) {
                res.status(409).json({message: "Email déjà existant, veuillez utiliser un autre email"})
                return;
            }
            newUser.save()
            .then(
                user => {
                    res.status(200).json({ message: `Bienvenue ${user.username}, ton compte a été créé avec succès. Tu peux te connecter !`, id: user._id })
                }
            )
            .catch (
                error => {
                    res.status(500).json(error)
                }
            )
            
        }
    })
});

router.post("/login", async (req, res) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if (!user) {
            res.status(404).json({error: `Aucun utilisateur n'a été trouvé avec cet email`});
        }
        else {
            bcrypt.compare(req.body.password, user.password, (error, match) => {
                if (error) res.status(500).json(error);
                else if (match) {
                    req.session.username = user.username;
                    req.session.userEmail = user.email;
                    req.session.userRole = user.role;
                    req.session.userId = user._id.toString();
                    const token = jwt.sign(
                        { id: user._id.toString(), role: user.role },
                        SECRET,
                        { expiresIn: "1h" }
                        );
                    res.status(200).json({message: `Salut ${user.username}, tu as été connecté avec succès !`, token})
                } else {
                    res.status(403).json({error: "Le mot de passe est incorrect !"});
                }
            })
        }
    })
    .catch(error => {
        res.status(500).json(error)
    })    
})

export default router;