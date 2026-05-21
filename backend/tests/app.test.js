import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

describe("MediBook API", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("GET / retourne le message de bienvenue", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("OK");
    expect(response.body.message).toBe("Bienvenue sur l'API MediBook");
  });

  test("GET /api/health retourne le statut de l'API", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("OK");
    expect(response.body.service).toBe("MediBook API");
  });

  test("GET /api/db-check retourne database connected", async () => {
    const response = await request(app).get("/api/db-check");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("OK");
    expect(response.body.database).toBe("connected");
  });

  test("GET /api/auth/test retourne le module auth", async () => {
    const response = await request(app).get("/api/auth/test");

    expect(response.status).toBe(200);
    expect(response.body.module).toBe("auth");
  });
});
