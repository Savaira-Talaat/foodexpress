import express from "express";
import bcrypt from "bcrypt";
import { User } from "../mongo.js";
import { isAdmin } from "../middlewares/authentication.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
});

router.put("/updateUser/:id", async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId);
    const newEmailUser = await User.findOne({email : req.body.email});

    if (newEmailUser !== null && req.body.email !== user.email) {
        res.status(409).json({message: `Email déjà existant, veuillez utiliser une autre adresse email`});
        return;
    }

    bcrypt.hash(req.body.password, 10, async (error, hash) => {
        if (error) {
            res.status(500).json(error);
        } else {
            const user = await User.findByIdAndUpdate(
                userId,
                {...req.body, password: hash},
                {new: true}
            );
            if (!user) {
                res.status(404).json({error: `Utilisateur introuvable dans la base de données`});
                return;
            }
            res.status(200).json({message: `L'utilisateur ${userId} a bien été modifié`, user})
        }
    });

});

router.delete("/deleteUser/:id", isAdmin, async (req, res) => {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
        res.status(404).json({message:`Utilisateur introuvable dans la base de données`});
        return;
    }
    res.status(200).json({message: `L'utilisateur ${userId} a bien été supprimé`})
});

export default router;