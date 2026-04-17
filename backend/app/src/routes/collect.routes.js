import express from "express";
import { verifyAdmin } from "../middleware/auth.middleware.js";
import { runHarvestingJob } from "../services/collector.service.js";

export const collectorRouter = express.Router();

// Week 10: In-memory Task Queue to prevent blocking
const jobQueue = [];
let isProcessing = false;

const processQueue = async () => {
  if (isProcessing || jobQueue.length === 0) return;
  isProcessing = true;
  
  while (jobQueue.length > 0) {
    const job = jobQueue.shift();
    try {
      await runHarvestingJob(job.query, job.limit);
    } catch (err) {
      console.error("Job processing failed", err.message);
    }
  }
  isProcessing = false;
};

/**
 * @swagger
 * /collect:
 *   post:
 *     summary: Trigger metadata collection (Protected, async)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *               limit:
 *                 type: integer
 *     responses:
 *       202:
 *         description: Job accepted
 */
// Added verifyAdmin to satisfy Week 9 (Security)
collectorRouter.post("/", verifyAdmin, (req, res) => {
  const query = String(req.body.query || "").trim();
  const limit = Number(req.body.limit || 20);

  if (!query) {
    return res.status(400).json({ error: "query is required" });
  }

  // Week 10 (Async Processing): Return 202 quickly and add to queue
  jobQueue.push({ query, limit });
  processQueue(); // Fire and forget

  res.status(202).json({ 
    message: "Harvesting job accepted and dispatched to background queue.",
    status: "processing"
  });
});