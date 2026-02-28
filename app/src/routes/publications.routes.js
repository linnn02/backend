import express from "express";
import { prisma } from "../services/db.js";

export const publicationsRouter = express.Router();

/**
 * @swagger
 * /publications/stats/summary:
 *   get:
 *     summary: Get statistics summary
 *     responses:
 *       200:
 *         description: Stats data
 */
publicationsRouter.get("/stats/summary", async (req, res) => {
  try {
    const total = await prisma.publication.count();

    const topVenues = await prisma.publication.groupBy({
      by: ["venue"],
      where: { venue: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10
    });

    const topYears = await prisma.publication.groupBy({
      by: ["year"],
      where: { year: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10
    });

    res.json({ total, topYears, topVenues });
  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ error: "Stats failed" });
  }
});

/**
 * @swagger
 * /publications/search/all:
 *   get:
 *     summary: Search publications
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: yearFrom
 *         schema:
 *           type: integer
 *       - in: query
 *         name: yearTo
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Search results
 */
publicationsRouter.get("/search/all", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const yearFrom = req.query.yearFrom ? Number(req.query.yearFrom) : null;
    const yearTo = req.query.yearTo ? Number(req.query.yearTo) : null;

    const where = {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { venue: { contains: q, mode: "insensitive" } }
              ]
            }
          : {},
        Number.isFinite(yearFrom) ? { year: { gte: yearFrom } } : {},
        Number.isFinite(yearTo) ? { year: { lte: yearTo } } : {}
      ]
    };

    const items = await prisma.publication.findMany({
      where,
      take: 50,
      orderBy: { citations: "desc" }
    });

    res.json({ q, count: items.length, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

/**
 * @swagger
 * /publications:
 *   get:
 *     summary: Get paginated publications
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of publications
 */
publicationsRouter.get("/", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.publication.findMany({
        skip,
        take: limit,
        orderBy: { id: "desc" }
      }),
      prisma.publication.count()
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "List failed" });
  }
});

/**
 * GET BY ID
 * GET /publications/1
 */
publicationsRouter.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const item = await prisma.publication.findUnique({
      where: { id }
    });

    if (!item) return res.status(404).json({ error: "Publication not found" });

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Get by id failed" });
  }
});