import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

const suffix = Date.now();

const patientEmail = `patient-${suffix}@test.com`;
const doctorEmail = `doctor-${suffix}@test.com`;
const adminEmail = `admin-${suffix}@test.com`;

let patientToken;
let doctorProfile;
let appointmentId;

describe("MediBook integration tests", () => {
  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);

    const doctorUser = await prisma.user.create({
      data: {
        email: doctorEmail,
        password: hashedPassword,
        firstName: "Test",
        lastName: "Doctor",
        role: "DOCTOR"
      }
    });

    doctorProfile = await prisma.doctorProfile.create({
      data: {
        userId: doctorUser.id,
        specialty: "Test médecine",
        city: "Test city",
        description: "Médecin créé pour les tests",
        price: 50
      }
    });

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: "Test",
        lastName: "Admin",
        role: "ADMIN"
      }
    });
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({
      where: {
        OR: [
          { reason: { contains: `test-${suffix}` } },
          { doctorId: doctorProfile?.id }
        ]
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [patientEmail, doctorEmail, adminEmail]
        }
      }
    });

    await prisma.$disconnect();
  });

  test("POST /api/auth/register crée un patient", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: patientEmail,
        password: "password123",
        firstName: "Test",
        lastName: "Patient"
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Compte créé avec succès");
    expect(response.body.user.email).toBe(patientEmail);
    expect(response.body.user.role).toBe("PATIENT");
  });

  test("POST /api/auth/register refuse un email déjà utilisé", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: patientEmail,
        password: "password123",
        firstName: "Test",
        lastName: "Patient"
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Cet email est déjà utilisé");
  });

  test("POST /api/auth/login connecte un utilisateur", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: patientEmail,
        password: "password123"
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Connexion réussie");
    expect(response.body.token).toBeDefined();

    patientToken = response.body.token;
  });

  test("POST /api/auth/login refuse un mauvais mot de passe", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: patientEmail,
        password: "wrong-password"
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Email ou mot de passe incorrect");
  });

  test("GET /api/auth/me retourne l'utilisateur connecté", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(patientEmail);
  });

  test("GET /api/auth/me refuse une requête sans token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token manquant");
  });

  test("GET /api/auth/admin-test refuse un patient", async () => {
    const response = await request(app)
      .get("/api/auth/admin-test")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Accès interdit");
  });

  test("GET /api/doctors retourne la liste des médecins", async () => {
    const response = await request(app).get("/api/doctors");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Liste des médecins récupérée avec succès");
    expect(Array.isArray(response.body.doctors)).toBe(true);
  });

  test("POST /api/appointments crée un rendez-vous", async () => {
    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId: doctorProfile.id,
        startAt: "2030-05-20T10:00:00.000Z",
        endAt: "2030-05-20T10:30:00.000Z",
        reason: `consultation test-${suffix}`
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Rendez-vous réservé avec succès");

    appointmentId = response.body.appointment.id;
  });

  test("POST /api/appointments refuse un créneau déjà réservé", async () => {
    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId: doctorProfile.id,
        startAt: "2030-05-20T10:00:00.000Z",
        endAt: "2030-05-20T10:30:00.000Z",
        reason: `doublon test-${suffix}`
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Ce créneau est déjà réservé");
  });

  test("GET /api/appointments/me retourne les rendez-vous du patient", async () => {
    const response = await request(app)
      .get("/api/appointments/me")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Rendez-vous récupérés avec succès");
    expect(Array.isArray(response.body.appointments)).toBe(true);
  });

  test("PATCH /api/appointments/:id/cancel annule un rendez-vous", async () => {
    const response = await request(app)
      .patch(`/api/appointments/${appointmentId}/cancel`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Rendez-vous annulé avec succès");
    expect(response.body.appointment.status).toBe("CANCELLED");
  });
});
