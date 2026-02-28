import axios from "axios";

const BASE = "https://api.openalex.org";

export async function fetchWorks({ query, perPage = 25, page = 1 }) {
  const url = `${BASE}/works?search=${encodeURIComponent(query)}&per-page=${perPage}&page=${page}`;

  const { data } = await axios.get(url, {
    headers: { "User-Agent": "ScientificDataHarvester/1.0 (student project)" }
  });

  return data;
}