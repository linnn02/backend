import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { publicationsRouter } from "./routes/publications.routes.js";
import { collectorRouter } from "./routes/collect.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/publications", publicationsRouter);
app.use("/collect", collectorRouter);