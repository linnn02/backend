import express from "express";
import { prisma } from "../services/db.js";
import axios from "axios";

export const collectorRouter = express.Router();

/**
 * POST /collect
 * body: { query: string, limit?: number }
 */
collectorRouter.post("/", async (req, res) => {
  try {
    const query = String(req.body.query || "").trim();
    const limit = Number(req.body.limit || 20);

    if (!query) {
      return res.status(400).json({ error: "query is required" });
    }

    // пример запроса к OpenAlex
    const url = "https://api.openalex.org/works";
    const { data } = await axios.get(url, {
      params: {
        search: query,
        per_page: limit
      }
    });

    const works = data?.results || [];

    // сохраняем (простая версия)
    let saved = 0;
    for (const w of works) {
      await prisma.publication.create({
        data: {
          openalexId: w.id ?? null,
          doi: w.doi ?? null,
          title: w.title ?? null,
          abstract: null,
          year: w.publication_year ?? null,
          venue: w.host_venue?.display_name ?? null,
          url: w.primary_location?.landing_page_url ?? w.id ?? null,
          citations: w.cited_by_count ?? 0
        }
      });
      saved++;
    }

    res.json({ message: "Collect finished", result: { saved } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Collect failed" });
  }
});