import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { publicationsRouter } from "./routes/publications.routes.js";
import { collectorRouter } from "./routes/collect.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { initCronJobs } from "./scheduler.js";
import { logger } from "./services/logger.js";
import client from "prom-client";

import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

// Initialize metrics (Week 14)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'node_app_' });
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const app = express();

app.use(express.json());

// HTTP access log (Observability — Week 8/14)
app.use((req, res, next) => {
  const start = Date.now();
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    const ms = Date.now() - start;
    end({ route: req.route?.path || req.path, code: res.statusCode, method: req.method });
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

// --- Swagger ---
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Scientific Data Harvester API",
      version: "1.0.0",
      description: "API for collecting and browsing scientific publications"
    },
    servers: [
      {
        url: "/api",
        description: "API Gateway"
      },
      {
        url: "/",
        description: "Direct to Backend"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./src/routes/*.js"]
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Routes ---
app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/metrics", async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

app.use("/auth", authRouter);
app.use("/publications", publicationsRouter);
app.use("/collect", collectorRouter);

app.get("/swagger.json", (req, res) => res.json(swaggerSpec));

// Global error handler (Security: hides stack traces from clients)
app.use((err, req, res, _next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ error: "Internal Server Error" });
});

// Start Cron Jobs (Week 5)
initCronJobs();

// --- Start ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));

export default app;