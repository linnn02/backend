import axios from "axios";
import { prisma } from "./db.js";
import { logger } from "./logger.js";

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const USER_AGENTS = [
  "ScientistBot/1.0 (mailto:scholar@example.com)",
  "Mozilla/5.0 (compatible; ResearchCrawler/2.0; +https://example.com/bot)",
  "AcademicHarvester/1.1 (research project; contact@example.com)"
];

const fetchWithRetry = async (url, params, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const agent = USER_AGENTS[i % USER_AGENTS.length];
      logger.info(`[Collector] Fetching (attempt ${i + 1}): ${url} ua="${agent}"`);
      const response = await axios.get(url, {
        params,
        headers: { "User-Agent": agent },
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      logger.warn(`[Collector] Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) throw error;
      const backoff = 2000 * (i + 1);
      logger.info(`[Collector] Retrying in ${backoff}ms…`);
      await delay(backoff);
    }
  }
};

const normalizeItem = (w) => ({
  openalexId: w.id ?? `unknown-${Date.now()}-${Math.random()}`,
  doi: w.doi ?? null,
  title: w.title ?? "Untitled",
  abstract: w.abstract_inverted_index ? null : null, // raw abstract not in free tier
  year: w.publication_year ?? null,
  venue: w.host_venue?.display_name || w.primary_location?.source?.display_name || null,
  url: w.primary_location?.landing_page_url ?? w.id ?? null,
  citations: w.cited_by_count ?? 0,
  authors: (w.authorships || []).map(a => ({
    name: a.author?.display_name || "Unknown Author",
    openalexId: a.author?.id || `anon-${Math.random()}`
  })),
  keywords: (w.concepts || []).map(c => c.display_name).filter(Boolean)
});

export const runHarvestingJob = async (query, limit) => {
  logger.info(`[Collector] Job started — query="${query}", limit=${limit}`);

  try {
    const data = await fetchWithRetry("https://api.openalex.org/works", {
      search: query,
      per_page: limit
    });

    const works = data?.results || [];
    let saved = 0;
    let skipped = 0;

    for (const raw of works) {
      const norm = normalizeItem(raw);

      const exists = await prisma.publication.findUnique({
        where: { openalexId: norm.openalexId }
      });

      if (exists) {
        skipped++;
        continue;
      }

      await prisma.publication.create({
        data: {
          openalexId: norm.openalexId,
          doi: norm.doi,
          title: norm.title,
          year: norm.year,
          venue: norm.venue,
          url: norm.url,
          citations: norm.citations,
          authors: {
            create: norm.authors.map(a => ({
              author: {
                connectOrCreate: {
                  where: { openalexId: a.openalexId },
                  create: { name: a.name, openalexId: a.openalexId }
                }
              }
            }))
          },
          keywords: {
            create: norm.keywords.map(k => ({
              keyword: {
                connectOrCreate: {
                  where: { name: k },
                  create: { name: k }
                }
              }
            }))
          }
        }
      });
      saved++;
    }

    logger.info(`[Collector] Job done — saved=${saved}, skipped=${skipped} (duplicates)`);
    return { saved, skipped };
  } catch (err) {
    logger.error(`[Collector] Job failed: ${err.message}`, { stack: err.stack });
    throw err;
  }
};
