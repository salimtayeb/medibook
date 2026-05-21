import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";
import { authorizeRoles } from "../src/middlewares/auth.middleware.js";

const suffix = Date.now();

const patientEmail = `edge-patient-${suffix}@test.com`;
const otherPatientEmail = `edge-other-patient-${suffix}@test.com`;
const doctorEmail = `edge-doctor-${suffix}@test.com`;
const doctorNoProfileEmail = `edge-doctor-no-profile-${suffix}@test.com`;
const adminEmail = `edge-admin-${suffix}@test.com`;

let patientUser;
let otherPatientUser;
let doctorUser;
let doctorNoProfileUser;
let adminUser;
let doctorProfile;

let patientToken;
let otherPatientToken;
let doctorToken;
let doctorNoProfileToken;
let adminToken;

let appointmentForOtherPatientTest;
let appointmentAlreadyCancelled;
let appointmentDoctorCanCancel;
let appointmentAdminCanCancel;

function buildRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe("MediBook edge cases and error coverage", () => {
  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);

    patientUser = await prisma.user.create({
      data: {
        email: patientEmail,
        password: hashedPassword,
        firstName: "Edge",
        lastName: "Patient",
        role: "PATIENT"
      }
    });

    otherPatientUser = await prisma.user.create({
      data: {
        email: otherPatientEmail,
        password: hashedPassword,
        firstName: "Other",
        lastName: "Patient",
        role: "PATIENT"
      }
    });

    doctorUser = await prisma.user.create({
      data: {
        email: doctorEmail,
        password: hashedPassword,
        firstName: "Edge",
        lastName: "Doctor",
        role: "DOCTOR"
      }
    });

    doctorNoProfileUser = await prisma.user.create({
      data: {
        email: doctorNoProfileEmail,
        password: hashedPassword,
        firstName: "Doctor",
        lastName: "NoProfile",
        role: "DOCTOR"
      }
    });

    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: "Edge",
        lastName: "Admin",
        role: "ADMIN"
      }
    });

    doctorProfile = await prisma.doctorProfile.create({
      data: {
        userId: doctorUser.id,
        specialty: "Urgences",
        city: "Paris",
        description: "Médecin de test pour les cas limites",
        price: 80
      }
    });

    const patientLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: patientEmail, password: "password123" });
    patientToken = patientLogin.body.token;

    const otherPatientLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: otherPatientEmail, password: "password123" });
    otherPatientToken = otherPatientLogin.body.token;

    const doctorLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: doctorEmail, password: "password123" });
    doctorToken = doctorLogin.body.token;

    const doctorNoProfileLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: doctorNoProfileEmail, password: "password123" });
    doctorNoProfileToken = doctorNoProfileLogin.body.token;

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password: "password123" });
    adminToken = adminLogin.body.token;

    appointmentForOtherPatientTest = await prisma.appointment.create({
      data: {
        patientId: patientUser.id,
        doctorId: doctorProfile.id,
        startAt: new Date("2032-01-01T10:00:00.000Z"),
        endAt: new Date("2032-01-01T10:30:00.000Z"),
        reason: `edge-other-patient-test-${suffix}`,
        status: "PENDING"
      }
    });

    appointmentAlreadyCancelled = await prisma.appointment.create({
      data: {
        patientId: patientUser.id,
        doctorId: doctorProfile.id,
        startAt: new Date("2032-01-02T10:00:00.000Z"),
        endAt: new Date("2032-01-02T10:30:00.000Z"),
        reason: `edge-already-cancelled-${suffix}`,
        status: "CANCELLED"
      }
    });

    appointmentDoctorCanCancel = await prisma.appointment.create({
      data: {
        patientId: patientUser.id,
        doctorId: doctorProfile.id,
        startAt: new Date("2032-01-03T10:00:00.000Z"),
        endAt: new Date("2032-01-03T10:30:00.000Z"),
        reason: `edge-doctor-cancel-${suffix}`,
        status: "PENDING"
      }
    });

    appointmentAdminCanCancel = await prisma.appointment.create({
      data: {
        patientId: patientUser.id,
        doctorId: doctorProfile.id,
        startAt: new Date("2032-01-04T10:00:00.000Z"),
        endAt: new Date("2032-01-04T10:30:00.000Z"),
        reason: `edge-admin-cancel-${suffix}`,
        status: "PENDING"
      }
    });
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({
      where: {
        OR: [
          { doctorId: doctorProfile?.id },
          { patientId: { in: [patientUser?.id, otherPatientUser?.id] } }
        ]
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            patientEmail,
            otherPatientEmail,
            doctorEmail,
            doctorNoProfileEmail,
            adminEmail
          ]
        }
      }
    });

    await prisma.$disconnect();
  });

  test("GET /api/db-check retourne une erreur si la base échoue", async () => {
    const spy = jest
      .spyOn(prisma, "$queryRaw")
      .mockRejectedValueOnce(new Error("Database down"));

    const response = await request(app).get("/api/db-check");

    expect(response.status).toBe(500);
    expect(response.body.status).toBe("ERROR");
    expect(response.body.database).toBe("not connected");

    spy.mockRestore();
  });

  test("POST /api/auth/register refuse des données invalides", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "bad-email",
        password: "123",
        firstName: "A",
        lastName: "B"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Données invalides");
  });

  test("POST /api/auth/register gère une erreur serveur", async () => {
    const spy = jest
      .spyOn(prisma.user, "findUnique")
      .mockRejectedValueOnce(new Error("Server error"));

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: `register-error-${suffix}@test.com`,
        password: "password123",
        firstName: "Server",
        lastName: "Error"
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erreur serveur");

    spy.mockRestore();
  });

  test("POST /api/auth/login refuse des données invalides", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "bad-email",
        password: ""
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Données invalides");
  });

  test("POST /api/auth/login refuse un utilisateur introuvable", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: `missing-${suffix}@test.com`,
        password: "password123"
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Email ou mot de passe incorrect");
  });

  test("POST /api/auth/login gère une erreur serveur", async () => {
    const spy = jest
      .spyOn(prisma.user, "findUnique")
      .mockRejectedValueOnce(new Error("Server error"));

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: patientEmail,
        password: "password123"
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erreur serveur");

    spy.mockRestore();
  });

  test("GET /api/auth/me refuse un token invalide", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token invalide ou expiré");
  });

  test("GET /api/auth/me refuse un token avec utilisateur introuvable", async () => {
    const fakeToken = jwt.sign(
      {
        id: `missing-user-${suffix}`,
        email: `missing-${suffix}@test.com`,
        role: "PATIENT"
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Utilisateur non trouvé");
  });

  test("GET /api/auth/admin-test accepte un administrateur", async () => {
    const response = await request(app)
      .get("/api/auth/admin-test")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Bienvenue administrateur");
  });

  test("authorizeRoles refuse une requête sans req.user", () => {
    const req = {};
    const res = buildRes();
    const next = jest.fn();

    authorizeRoles("ADMIN")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Utilisateur non authentifié"
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("GET /api/doctors gère une erreur serveur", async () => {
    const spy = jest
      .spyOn(prisma.doctorProfile, "findMany")
      .mockRejectedValueOnce(new Error("Server error"));

    const response = await request(app).get("/api/doctors");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erreur serveur");

    spy.mockRestore();
  });

  test("POST /api/appointments refuse des données invalides", async () => {
    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId: "",
        startAt: "bad-date",
        endAt: "bad-date"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Données invalides");
  });

  test("POST /api/appointments refuse un utilisateur non patient", async () => {
    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        doctorId: doctorProfile.id,
        startAt: "2032-02-01T10:00:00.000Z",
        endAt: "2032-02-01T10:30:00.000Z",
        reason: `doctor-forbidden-${suffix}`
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Seuls les patients peuvent réserver un rendez-vous");
  });

  test("POST /api/appointments refuse une date de fin avant la date de début", async () => {
    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId: doctorProfile.id,
        startAt: "2032-02-02T10:30:00.000Z",
        endAt: "2032-02-02T10:00:00.000Z",
        reason: `bad-date-${suffix}`
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("La date de fin doit être après la date de début");
  });

  test("POST /api/appointments refuse un médecin introuvable", async () => {
    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId: `missing-doctor-${suffix}`,
        startAt: "2032-02-03T10:00:00.000Z",
        endAt: "2032-02-03T10:30:00.000Z",
        reason: `missing-doctor-${suffix}`
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Médecin introuvable");
  });

  test("POST /api/appointments gère une erreur serveur", async () => {
    const spy = jest
      .spyOn(prisma.doctorProfile, "findUnique")
      .mockRejectedValueOnce(new Error("Server error"));

    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId: doctorProfile.id,
        startAt: "2032-02-04T10:00:00.000Z",
        endAt: "2032-02-04T10:30:00.000Z",
        reason: `server-error-${suffix}`
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erreur serveur");

    spy.mockRestore();
  });

  test("GET /api/appointments/me retourne les rendez-vous du médecin", async () => {
    const response = await request(app)
      .get("/api/appointments/me")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Rendez-vous récupérés avec succès");
    expect(Array.isArray(response.body.appointments)).toBe(true);
  });

  test("GET /api/appointments/me refuse un médecin sans profil", async () => {
    const response = await request(app)
      .get("/api/appointments/me")
      .set("Authorization", `Bearer ${doctorNoProfileToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Profil médecin introuvable");
  });

  test("GET /api/appointments/me retourne les rendez-vous pour admin", async () => {
    const response = await request(app)
      .get("/api/appointments/me")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Rendez-vous récupérés avec succès");
    expect(Array.isArray(response.body.appointments)).toBe(true);
  });

  test("GET /api/appointments/me gère une erreur serveur", async () => {
    const spy = jest
      .spyOn(prisma.appointment, "findMany")
      .mockRejectedValueOnce(new Error("Server error"));

    const response = await request(app)
      .get("/api/appointments/me")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erreur serveur");

    spy.mockRestore();
  });

  test("PATCH /api/appointments/:id/cancel refuse un rendez-vous introuvable", async () => {
    const response = await request(app)
      .patch(`/api/appointments/missing-appointment-${suffix}/cancel`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Rendez-vous introuvable");
  });

  test("PATCH /api/appointments/:id/cancel refuse un patient non propriétaire", async () => {
    const response = await request(app)
      .patch(`/api/appointments/${appointmentForOtherPatientTest.id}/cancel`)
      .set("Authorization", `Bearer ${otherPatientToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Vous n'avez pas le droit d'annuler ce rendez-vous");
  });

  test("PATCH /api/appointments/:id/cancel refuse un médecin sans profil", async () => {
    const response = await request(app)
      .patch(`/api/appointments/${appointmentForOtherPatientTest.id}/cancel`)
      .set("Authorization", `Bearer ${doctorNoProfileToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Vous n'avez pas le droit d'annuler ce rendez-vous");
  });

  test("PATCH /api/appointments/:id/cancel refuse un rendez-vous déjà annulé", async () => {
    const response = await request(app)
      .patch(`/api/appointments/${appointmentAlreadyCancelled.id}/cancel`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Ce rendez-vous est déjà annulé");
  });

  test("PATCH /api/appointments/:id/cancel permet au médecin propriétaire d'annuler", async () => {
    const response = await request(app)
      .patch(`/api/appointments/${appointmentDoctorCanCancel.id}/cancel`)
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Rendez-vous annulé avec succès");
    expect(response.body.appointment.status).toBe("CANCELLED");
  });

  test("PATCH /api/appointments/:id/cancel permet à l'admin d'annuler", async () => {
    const response = await request(app)
      .patch(`/api/appointments/${appointmentAdminCanCancel.id}/cancel`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Rendez-vous annulé avec succès");
    expect(response.body.appointment.status).toBe("CANCELLED");
  });

  test("PATCH /api/appointments/:id/cancel gère une erreur serveur", async () => {
    const spy = jest
      .spyOn(prisma.appointment, "findUnique")
      .mockRejectedValueOnce(new Error("Server error"));

    const response = await request(app)
      .patch(`/api/appointments/${appointmentForOtherPatientTest.id}/cancel`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erreur serveur");

    spy.mockRestore();
  });
});
