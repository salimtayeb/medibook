import express from "express";
import { getPharmacies, createPharmacy, deletePharmacy } from "../controllers/pharmacy.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getPharmacies);
router.post("/", authenticate, authorizeRoles("ADMIN"), createPharmacy);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deletePharmacy);

export default router;
