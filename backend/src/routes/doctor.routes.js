import express from "express";
import { getDoctors, getDoctorProfile, updateProfile } from "../controllers/doctor.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getDoctors);
router.get("/me", authenticate, getDoctorProfile);
router.put("/profile", authenticate, updateProfile);

export default router;
