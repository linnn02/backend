import { prisma } from "./db.js";

export async function saveWork(work) {
  const openalexId = work?.id;
  if (!openalexId) return;

  const title = work?.title || "Untitled";
  const year = work?.publication_year ?? null;
  const venue = work?.primary_location?.source?.display_name || null;
  const url = work?.id || null;
  const citations = work?.cited_by_count ?? 0;

  await prisma.publication.upsert({
    where: { openalexId },
    update: { title, year, venue, url, citations },
    create: { openalexId, title, year, venue, url, citations }
  });
}