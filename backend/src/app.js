import express from "express";
import cors from "cors";
import prisma from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l'API MediBook",
    status: "OK"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "MediBook API",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/db-check", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "OK",
      database: "connected"
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "not connected",
      message: error.message
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);

export default app;
