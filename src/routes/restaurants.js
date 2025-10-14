import express from "express";
import { Restaurants } from "../mongo.js";
import { authenticateJWT, isAdmin } from "../middlewares/authentication.js";

const router = express.Router();

router.get("/", async (request, response) => {
  const restaurants = await Restaurants.find();
  response.status(200).json(restaurants);
});

router.get("/:id", async (request, response) => {
  const restaurants = await Restaurants.findById(request.params.id);
  response.status(200).json(restaurants);
});

router.get("/by-name/:name", async (req, res) => {
  try {
    const restaurant = await Restaurants.findOne({ name: req.params.name });
    if (!restaurant) return res.status(404).json({ message: "Aucun restaurant trouvé" });
    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/by-address/:address", async (req, res) => {
  try {
    const restaurant = await Restaurants.findOne({ address: req.params.address });
    if (!restaurant) return res.status(404).json({ message: "Aucun restaurant trouvé" });
    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post('/create-restaurant', authenticateJWT, isAdmin, (request, response) => {
  try {
      const newRestaurant = Restaurants({ ...request.body });
      newRestaurant.save()
      .then(
          restaurants => {
              response.status(200).json({ message: `${restaurants.name} a été créé avec succès. Voici son id:`, id: newRestaurant._id })
          }
      )
    } catch (error) {
      response.status(200).json({})
    }
      
});

router.put('/modify-restaurant/:id', authenticateJWT, isAdmin, async (request, response) => {
  try {
    const { id } = request.params;

    const updatedRestaurant = await Restaurants.findByIdAndUpdate(
      id,
      request.body,
      { new: true } // retourne le document modifié
    );

    if (!updatedRestaurant) {
      return response.status(404).json({ message: "Restaurant non trouvé" });
    }

    response.status(200).json({
      message: `${updatedRestaurant.name} a été modifié avec succès.`,
      restaurant: updatedRestaurant
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Erreur lors de la modification du restaurant" });
  }
});

router.delete('/delete-restaurant/:id', authenticateJWT, isAdmin, async (request, response) => {
  try {
    const { id } = request.params;

    const deletedRestaurant = await Restaurants.findByIdAndDelete(id);

    if (!deletedRestaurant) {
      return response.status(404).json({ message: "Restaurant non trouvé" });
    }

    response.status(200).json({
      message: `${deletedRestaurant.name} a été supprimé avec succès.`
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Erreur lors de la suppression du restaurant" });
  }
});


export default router;