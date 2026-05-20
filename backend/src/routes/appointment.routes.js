import express from "express";
import {
  createAppointment,
  getMyAppointments,
  cancelAppointment
} from "../controllers/appointment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createAppointment);
router.get("/me", authenticate, getMyAppointments);
router.patch("/:id/cancel", authenticate, cancelAppointment);

export default router;
