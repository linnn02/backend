import express from "express";

import { publicationsRouter } from "./routes/publications.routes.js";
import { collectorRouter } from "./routes/collect.routes.js"; 

import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const app = express();

app.use(express.json());

// --- Swagger ---
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Scientific Data Harvester API",
      version: "1.0.0",
      description: "API for collecting and browsing scientific publications"
    }
  },
  apis: ["./src/routes/*.js"] // <-- ВАЖНО: чтобы JSDoc из роутов подхватывался
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Routes ---
app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/publications", publicationsRouter);
app.use("/collect", collectorRouter); // если collectorRouter делает POST "/" внутри

app.get("/", (req, res) => {
  res.redirect("/api-docs");
});
// --- Start ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;