import { fetchWorks } from "./openalexCollector.js";
import { saveWork } from "../services/saveOpenAlex.js";

export async function runCollect({ query, limit = 50 }) {
  let saved = 0;
  let page = 1;

  while (saved < limit) {
    const data = await fetchWorks({ query, perPage: 25, page });
    const results = data?.results || [];
    if (results.length === 0) break;

    for (const work of results) {
      await saveWork(work);
      saved += 1;
      if (saved >= limit) break;
    }

    page += 1;
  }

  return { saved };
}