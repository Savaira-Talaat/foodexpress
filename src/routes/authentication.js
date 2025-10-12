import express, { response } from "express";
import bcrypt from "bcrypt";
import { User } from "../mongo.js";

const router = express.Router();
const rounds = 10;

router.post("/register", async (request, response) => {
    bcrypt.hash(request.body.password, rounds, async (error, hash) => {
        if (error) {
            response.status(500).json(error);
        }
        else {
            const newUser = User ({...request.body, password: hash});
            const userEmail = await User.findOne({email: newUser.email})
            if (userEmail !== null) {
                response.status(409).json({message: "Email déjà existant, veuillez utiliser un autre email"})
                return;
            }
            newUser.save()
            .then(
                user => {
                    response.status(200).json({ message: `Bienvenue ${user.username}, ton compte a été créé avec succès. Tu peux te connecter !`, id: user._id })
                }
            )
            .catch (
                error => {
                    response.status(500).json(error)
                }
            )
            
        }
    })
});

router.post("/login", async (request, response) => {
    User.findOne({email: request.body.email})
    .then(user => {
        if (!user) {
            response.status(404).json({error: `Aucun utilisateur n'a été trouvé avec cet email`});
        }
        else {
            bcrypt.compare(request.body.password, user.password, (error, match) => {
                if (error) response.status(500).json(error);
                else if (match) {
                    request.session.username = user.username;
                    request.session.userEmail = user.email;
                    request.session.userRole = user.userRole;
                    request.session.userId = user.userId;
                    response.status(200).json({message: `Salut ${user.username}, tu as été connecté avec succès !`})
                } else {
                    response.status(403).json({error: "Le mot de passe est incorrect !"});
                }
            })
        }
    })
    .catch(error => {
        response.status(500).json(error)
    })    
})

export default router;