import express, { response } from 'express';
import { Menus } from '../mongo.js';
import { authenticateJWT, isAdmin } from "../middlewares/authentication.js";

const router = express.Router();


router.get("/", async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const sortField = req.query.sortBy;
        const sortOrder = req.query.order === "desc" ? -1 : 1;
        const sortOptions = {};
        if (sortField) sortOptions[sortField] = sortOrder;
        const menus = await Menus.find()
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        const totalMenus = await Menus.countDocuments();

        res.status(200).json({
            page,
            totalPages: Math.ceil(totalMenus / limit),
            totalMenus,
            menus
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des menus." });
    }
});
router.get("/:id", async(req, res) => {
    try {
        const menu = await Menus.findById(req.params.id);
        if (!menu) return res.status(404).json({ message: "Menu introuvable." });
        res.status(200).json(menu);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Erreur lors de la récupération du menu."});
    }
});

router.post("/", authenticateJWT, isAdmin, async(req, res) => {
    try {
        if (!req.body.restaurant_id) {
            return res.status(400).json({ message: "restaurant_id manquant" });
        }
        const newMenu = new Menus ({...req.body});
        await newMenu.save()
        res.status(200).json({message: `Le menu ${newMenu.name} a été créé avec succès.`, menu: newMenu});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Erreur lors de la création du menu"})
    }
});

router.put("/:id", authenticateJWT, isAdmin, async(req, res) => {
    try {
        const menuId = req.params.id;
        if (!menuId) {
            return res.status(400).json({ message: "ID du menu manquant" });
        }
        const updateMenu = await Menus.findByIdAndUpdate(
            menuId,
            req.body,
            {new: true}
        );
        if (!updateMenu) {
            return res.status(404).json({message: "Menu introuvable."})
        }
        res.status(200).json({
            message: `Le menu ${updateMenu.name} a été modifié avec succès.`,
            menu: updateMenu
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la modification du menu."});
    }
});

router.delete("/:id", authenticateJWT, isAdmin, async(req, res) => {
    try {
        const menuId = req.params.id;
        if (!menuId) {
            return res.status(400).json({ message: "ID du menu manquant" });
        }
        const deleteMenu = await Menus.findByIdAndDelete(menuId);
        if (!deleteMenu) {
            return res.status(404).json({message: "Menu introuvable."});
        }
        
        res.status(200).json({message: `Le menu ${deleteMenu.name} a été supprimé avec succès`});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression du menu." });
    }
});

export default router;