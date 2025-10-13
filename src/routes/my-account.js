import express from 'express';
import { User } from '../mongo.js';
import { authenticateJWT, isUserOrAdmin } from '../middlewares/authentication.js';

const router = express.Router();

router.get("/", authenticateJWT, async (req, res) => {
    console.log("Session userId:", req.session.userId);
    const user = await User.findById(req.session.userId);
    res.status(200).json(user);
});

router.get("/logout", async (req, res) => {
    req.session.destroy();
    res.status(200).json({message: "Vous avez été déconnecté avec succcès !" });
});

router.put("/", authenticateJWT, async (req, res) => {
    try {
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }
        const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
        if (!updatedUser) return res.status(404).json({ message: "Utilisateur introuvable" });
        res.status(200).json({ message: "Compte mis à jour", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error });
    }
});

router.delete("/", authenticateJWT, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.user.id);
        if (!deletedUser) return res.status(404).json({ message: "Utilisateur introuvable" });
        res.status(200).json({ message: "Compte supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error });
    }
});

export default router;