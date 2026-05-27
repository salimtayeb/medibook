import express from "express";
import { addFavorite, removeFavorite, getMyFavorites } from "../controllers/favorite.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getMyFavorites);
router.post("/:doctorId", authenticate, addFavorite);
router.delete("/:doctorId", authenticate, removeFavorite);

export default router;
