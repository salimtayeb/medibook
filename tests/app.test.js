import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

describe("MediBook API", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("GET / should return API welcome message", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("OK");
    expect(response.body.message).toBe("Bienvenue sur l'API MediBook");
  });

  test("GET /api/health should return API health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("OK");
    expect(response.body.service).toBe("MediBook API");
  });

  test("GET /api/auth/test should return auth module message", async () => {
    const response = await request(app).get("/api/auth/test");

    expect(response.status).toBe(200);
    expect(response.body.module).toBe("auth");
  });
});
