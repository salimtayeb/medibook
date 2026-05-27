import express from "express";
import {
  createAppointment,
  getMyAppointments,
  confirmAppointment,
  completeAppointment,
  cancelAppointment
} from "../controllers/appointment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createAppointment);
router.get("/me", authenticate, getMyAppointments);
router.patch("/:id/confirm", authenticate, confirmAppointment);
router.patch("/:id/complete", authenticate, completeAppointment);
router.patch("/:id/cancel", authenticate, cancelAppointment);

export default router;
