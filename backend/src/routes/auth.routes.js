import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    message: "Route auth fonctionnelle",
    module: "auth"
  });
});

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, (req, res) => {
  res.json({
    message: "Utilisateur connecté",
    user: req.user
  });
});

router.get("/admin-test", authenticate, authorizeRoles("ADMIN"), (req, res) => {
  res.json({
    message: "Bienvenue administrateur",
    user: req.user
  });
});

export default router;
