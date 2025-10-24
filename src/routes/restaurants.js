import express from "express";
import mongoose from "mongoose";
import { Restaurants } from "../mongo.js";
import { authenticateJWT, isAdmin } from "../middlewares/authentication.js";

const router = express.Router();

router.get("/by-name/:name", async (req, res) => {
  try {
    const restaurant = await Restaurants.findOne({ name: req.params.name }).lean();
    if (!restaurant) return res.status(404).json({ message: "Aucun restaurant trouvé" });
    res.status(200).json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/by-address/:address", async (req, res) => {
  try {
    const restaurant = await Restaurants.findOne({ address: req.params.address }).lean();
    if (!restaurant) return res.status(404).json({ message: "Aucun restaurant trouvé" });
    res.status(200).json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/", async (request, response) => {
  try {
    const perPage = 10;
    const page = Math.max(1, parseInt(request.query.page, 10) || 1);
    const skip = (page - 1) * perPage;

    const [total, restaurants] = await Promise.all([
      Restaurants.countDocuments(),
      Restaurants.find().sort({ _id: 1 }).skip(skip).limit(perPage).lean()
    ]);

    response.status(200).json({
      data: restaurants,
      meta: {
        current_page: page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage)
      },
      links: {
        next: page * perPage < total ? `?page=${page + 1}` : null,
        prev: page > 1 ? `?page=${page - 1}` : null
      }
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/:id", async (request, response) => {
  try {
    const id = request.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return response.status(400).json({ message: "ID invalide" });

    const restaurant = await Restaurants.findById(id).lean();
    if (!restaurant) return response.status(404).json({ message: "Restaurant non trouvé" });

    response.status(200).json(restaurant);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Erreur serveur" });
  }
});

router.post('/create-restaurant', authenticateJWT, isAdmin, async (request, response) => {
  try {
    const newRestaurant = new Restaurants({ ...request.body });
    const saved = await newRestaurant.save();
    response.status(201).json({ message: `${saved.name} a été créé avec succès.`, id: saved._id });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Erreur lors de la création du restaurant" });
  }
});

router.put('/modify-restaurant/:id', authenticateJWT, isAdmin, async (request, response) => {
  try {
    const { id } = request.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return response.status(400).json({ message: "ID invalide" });

    const updatedRestaurant = await Restaurants.findByIdAndUpdate(id, request.body, { new: true }).lean();

    if (!updatedRestaurant) return response.status(404).json({ message: "Restaurant non trouvé" });

    response.status(200).json({ message: `${updatedRestaurant.name} a été modifié avec succès.`, restaurant: updatedRestaurant });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Erreur lors de la modification du restaurant" });
  }
});

router.delete('/delete-restaurant/:id', authenticateJWT, isAdmin, async (request, response) => {
  try {
    const { id } = request.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return response.status(400).json({ message: "ID invalide" });

    const deletedRestaurant = await Restaurants.findByIdAndDelete(id).lean();
    if (!deletedRestaurant) return response.status(404).json({ message: "Restaurant non trouvé" });

    response.status(200).json({ message: `${deletedRestaurant.name} a été supprimé avec succès.` });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Erreur lors de la suppression du restaurant" });
  }
});

export default router;