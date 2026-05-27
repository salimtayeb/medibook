import express from "express";
import { createReview, getDoctorReviews, deleteReview } from "../controllers/review.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createReview);
router.get("/:doctorId", getDoctorReviews);
router.delete("/:id", authenticate, deleteReview);

export default router;
