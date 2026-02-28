import express from "express";
import { publicationsRouter } from "./routes/publications.routes.js";
import { collectRouter } from "./routes/collect.routes.js";

export const app = express();
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/publications", publicationsRouter);
app.use("/collect", collectRouter);