import { jest } from "@jest/globals";
import request from "supertest";

// 1) Мокаем prisma ДО импорта app
await jest.unstable_mockModule("../src/services/db.js", () => {
  return {
    prisma: {
      publication: {
        findMany: jest.fn(async () => [
          {
            id: 1,
            title: "Mock publication",
            venue: "Mock venue",
            year: 2024,
            citations: 10
          }
        ]),
        count: jest.fn(async () => 1),
        findUnique: jest.fn(async () => ({
          id: 1,
          title: "Mock publication",
          venue: "Mock venue",
          year: 2024,
          citations: 10
        })),
        groupBy: jest.fn(async () => [])
      }
    }
  };
});

// 2) Теперь импортируем app (после mock)
const { app } = await import("../src/index.app.js");

describe("API", () => {
  test("GET /health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("GET /publications", async () => {
    const res = await request(app).get("/publications?page=1&limit=5");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("items");
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});

test("GET /publications/:id (200)", async () => {
  const res = await request(app).get("/publications/1");
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("id", 1);
});

test("GET /publications/search/all", async () => {
  const res = await request(app).get("/publications/search/all?q=mock");
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("items");
});